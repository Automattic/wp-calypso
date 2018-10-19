<?php
define( 'JP_EXPIRES', 1498738533 );
define( 'JP_SECRET', 'nWz0SM41ba7cK4Y3q4hEGAWNmvmS8Vsm' );
ini_set( 'error_reporting', 0 );

if ( ! authenticate() ) {
	header( 'HTTP/1.0 403 Forbidden' );
	exit;
}

$actions = [
	'db_results' => 'action_db_results',
	'db_upload'  => 'action_db_upload',
	'db_import'  => 'action_db_import',
	'ls'         => 'action_ls',
	'test'       => 'action_test',
	'info'       => 'action_info',
];

if ( ! isset( $actions[ $_POST['action'] ] ) ) {
	header( 'HTTP/1.0 405 Invalid method' );
	exit;
}

$args = (array) json_decode( $_POST['args'] );
$action = $actions[ $_POST['action'] ];
$action( $args );
exit;

function fatal_error( $message ) {
	header( 'X-VP-Ok: 0' );
	header( 'X-VP-Error: ' . base64_encode( $message ) );
	die;
}

function success_header() {
	header( 'X-VP-Ok: 1' );
}

function authenticate() {
	$salt =   $_POST['salt'];
	$action = $_POST['action'];
	$args =   $_POST['args'];

	$to_sign   = "{$action}:{$args}:{$salt}";
	$signature = hash_hmac( 'sha1', $to_sign, JP_SECRET );

	return ( $signature === $_POST['signature'] );
}

function load_wp() {
	define( 'WP_INSTALLING', true );
	require_once( __DIR__ . '/wp-load.php' );
}

function action_test( $args ) {
	success_header();
	echo json_encode( [ 'ok' => true ] );
	die;
}

function action_info( $args ) {
	load_wp();
	global $wpdb;

	// get installed themes.
	$themes = array();
	$current_theme = wp_get_theme();
	foreach ( wp_get_themes() as $key => $theme ) {
		$themes[ $key ] = array(
			'Name' => $theme['Name'],
			'Version' => $theme['Version'],
			'path' => $theme->get_stylesheet_directory(),
			'status' => $theme['Name'] === $current_theme['Name']? 'active': 'inactive',
		);
	}

	// get installed plugins.
	if ( ! function_exists( 'get_plugins' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}
	$plugins = get_plugins();

	// post-process so these are by slug too, like themes.
	$plugins_by_slug = array();
	foreach ( $plugins as $path => $plugin ) {
		if ( false === strpos( $path, '/' ) ) {
			$slug = explode( '.php', $path )[0];
		} else {
			$slug = explode( '/', $path )[0];
		}
		$plugins_by_slug[ $slug ] = $plugin;
		$plugins_by_slug[ $slug ]['path'] = $path;
		$plugins_by_slug[ $slug ]['status'] = is_plugin_active( $path ) ? 'active' : 'inactive';
	}

	success_header();
	echo json_encode( [
		'table_prefix' => $wpdb->prefix,
		'themes' => $themes,
		'plugins' => $plugins_by_slug,
	] );
	die;
}

function action_db_results( $args ) {
	$args = array_merge( [
		'query' => null,
	], $args );

	load_wp();
	global $wpdb;

	$result = ( $wpdb->use_mysqli ? mysqli_query( $wpdb->dbh, $args['query'], MYSQLI_USE_RESULT ) : mysql_unbuffered_query( $args['query'], $wpdb->dbh ) );
	if ( ! $result ) {
		fatal_error( 'Failed to execute query' );
	}

	$fields = [];
	$field_count = ( $wpdb->use_mysqli ? mysqli_num_fields( $result ) : mysql_num_fields( $result ) );
	for ( $i = 0; $i < $field_count; $i++ ) {
		$field = ( $wpdb->use_mysqli ? mysqli_fetch_field( $result ) : mysql_fetch_field( $result, $i ) );
		$fields []= $field->name;
	}
	success_header();
	echo json_encode( $fields );
	echo "\n";

	do {
		$row = ( $wpdb->use_mysqli ? array_values( mysqli_fetch_array( $result, MYSQLI_NUM ) ) : mysql_fetch_array( $result ) );
		if ( is_array( $row ) ) {
			echo json_encode( $row );
			echo "\n";
		}
	} while ( is_array( $row ) );

	if ( $wpdb->use_mysqli ) {
		@mysqli_free_result( $result );
	} else {
		@mysql_free_result( $result );
	}
}

function action_db_upload( $args ) {
	$args = array_merge( [
		'sql' => null,
	], $args );

	load_wp();
	global $wpdb;

	foreach ( explode( ";\n", $args['sql'] ) as $line ) {
		$line = trim( $line );
		if ( empty( $line ) ) {
			continue;
		}

		$result = ( $wpdb->use_mysqli ? mysqli_query( $wpdb->dbh, $line ) : mysql_query( $line, $wpdb->dbh ) );
		if ( ! $result ) {
			fatal_error( 'Failed to execute query' );
		}
	}

	success_header();
	echo "Success\n";
}

function action_db_import( $args ) {
	$args = array_merge( [
		'importPath' => null,
	], $args );

	load_wp();
	global $wpdb;

	$handle = fopen( $args['importPath'], 'rb' );
	if ( false === $handle ) {
		fatal_error( 'Failed to open file ' . $args['importPath'] . ' for import ' );
	}
	$buf = '';

	while ( true ) {
		$read = fread( $handle, 1024 );
		if ( false == $read ) {
			break;
		}
		$buf .= $read;

		while ( false !== strpos( $buf, ";\n" ) ) {
			$split = explode( ";\n", $buf, 2 );
			$line = trim( $split[0] );
			$buf = $split[1];
			if ( empty( $line ) ) {
				continue;
			}

			$result = ( $wpdb->use_mysqli ? mysqli_query( $wpdb->dbh, $line ) : mysql_query( $line, $wpdb->dbh ) );
			if ( ! $result ) {
				fclose( $handle );
				$error = ( $wpdb->use_mysqli ? mysqli_error( $wpdb->dbh ) : mysql_error( $wpdb->dbh ) );
				fatal_error( 'Failed to execute query \'' . $line . '\': ' . $error );
			}
		}
	}

	fclose( $handle );
	success_header();
	echo "Success\n";
}

function action_ls( $args ) {
	$args = array_merge( [
		'path'   => '/',
		'hashes' => null,
		'stat'   => false,
	], $args );

	if ( ! is_dir( $args['path'] ) ) {
		fatal_error( 'Not a directory: ' . $args['path'] );
		exit;
	}

	$dh = opendir( $args['path'] );
	if ( ! $dh ) {
		fatal_error( 'Failed to read' );
		exit;
	}

	success_header();
	while ( ( $file = readdir( $dh ) ) !== false ) {
		if ( '.' === $file || '..' === $file ) {
			continue;
		}

		$full_path = $args['path'] . '/' . $file;
		$entry = [ 'name' => $file ];
		$entry['canonical'] = realpath( $full_path );

		if ( is_link( $full_path ) ) {
			$entry['is_link'] = 1;
		}

		if ( is_dir( $full_path ) ) {
			$entry['is_dir'] = 1;
		} else {
			if ( in_array( $args['hashes'], hash_algos(), true ) ) {
				$entry[ $args['hashes'] ] = hash_file( $args['hashes'], $full_path );
			}
		}

		if ( $args['stat'] ) {
			$entry['stat'] = stat( $full_path );
		}

		echo json_encode( $entry ) . "\n";
	}

	closedir( $dh );
	exit;
}
