import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import wpcom from 'calypso/lib/wp';

/**
 * We make a separate request rather than using getSite here to
 * avoid querying the WP.com cache of a site, which returns theme
 * errors for the multisite (caused by its 'force=wpcom' param).
 */
function querySiteDataWithoutForceWpcom( siteId ) {
	return wpcom.req.get( {
		path: '/sites/' + encodeURIComponent( siteId ),
		apiVersion: '1.1',
		query: {
			fields: 'ID,options',
			options: 'theme_errors',
		},
	} );
}

const ThemeErrors = ( { siteId } ) => {
	const translate = useTranslate();
	const [ themeErrors, setThemeErrors ] = useState( [] );

	useEffect( () => {
		querySiteDataWithoutForceWpcom( siteId ).then( ( siteData ) => {
			const errors = siteData?.options?.theme_errors;
			setThemeErrors( errors || [] );
		} );
	}, [ siteId ] );

	const dismissNotice = ( themeName, errorIndex ) => {
		setThemeErrors( ( prevErrors ) =>
			prevErrors
				.map( ( theme ) =>
					theme.name === themeName
						? {
								...theme,
								errors: theme.errors.filter( ( _, index ) => index !== errorIndex ),
						  }
						: theme
				)
				.filter( ( theme ) => theme.errors.length > 0 )
		);
	};

	if ( themeErrors.length === 0 ) {
		return null;
	}

	return (
		<>
			{ themeErrors.map( ( theme ) =>
				theme.errors.map( ( error, index ) => (
					<Notice
						status="is-error"
						key={ index }
						onDismissClick={ () => dismissNotice( theme.name, index ) }
					>
						{ translate( 'Error with theme {{strong}}%(themeName)s{{/strong}}: %(themeError)s', {
							args: {
								themeName: theme.name,
								themeError: error,
							},
							components: {
								strong: <strong />,
							},
						} ) }
					</Notice>
				) )
			) }
		</>
	);
};

export default ThemeErrors;
