<?php

class WP_Interface_Screen_Replacer {

	protected $new = '';

	protected $old = '';

	protected $name = '';

	public function __construct( $new, $old, $name ) {
		$this->new = $new;
		$this->old = $old;
		$this->name = $name;
		add_action( 'admin_menu', [ $this, 'do_screen_replace'], 100000 ); // just after the Nav Unification
	}

	public function do_screen_replace() {
		// @todo better distinguishing of top menus and submenus
		remove_menu_page( $this->new );
		// @todo ensure that the first submenu that duplicates the top menu is also removed
		$this->update_menu( $this->old, $this->new, $this->name );
	}

	/**
	 * Updates the menu data of the given menu slug.
	 *
	 * @param string $slug Slug of the menu to update.
	 * @param string $url New menu URL.
	 * @param string $title New menu title.
	 * @param string $cap New menu capability.
	 * @param string $icon New menu icon.
	 * @param int    $position New menu position.
	 * @return bool Whether the menu has been updated.
	 */
	public function update_menu( $slug, $url = null, $title = null, $cap = null, $icon = null, $position = null ) {
		global $menu, $submenu;

		$menu_item     = null;
		$menu_position = null;

		foreach ( $menu as $i => $item ) {
			if ( $slug === $item[2] ) {
				$menu_item     = $item;
				$menu_position = $i;
				break;
			}
		}

		if ( ! $menu_item ) {
			return false;
		}

		if ( $title ) {
			$menu_item[0] = $title;
			$menu_item[3] = esc_attr( $title );
		}

		if ( $cap ) {
			$menu_item[1] = $cap;
		}

		// Change parent slug only if there are no submenus (the slug of the 1st submenu will be used if there are submenus).
		if ( $url ) {
			remove_submenu_page( $slug, $slug );
			if ( empty( $submenu[ $slug ] ) ) {
				$menu_item[2] = $url;
			}
		}

		if ( $icon ) {
			$menu_item[4] = 'menu-top';
			$menu_item[6] = $icon;
		}

		if ( $position ) {
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			unset( $menu[ $menu_position ] );
			$menu_position = $position;
		}
		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$menu[ $menu_position ] = $menu_item;

		// Only add submenu when there are other submenu items.
		if ( $url && ! empty( $submenu[ $slug ] ) ) {
			add_submenu_page( $slug, $menu_item[3], $menu_item[0], $menu_item[1], $url, null, 0 );
		}

		return true;
	}

	/**
	 * Updates the submenus of the given menu slug.
	 *
	 * @param string $slug Menu slug.
	 * @param array  $submenus_to_update Array of new submenu slugs.
	 */
	public function update_submenus( $slug, $submenus_to_update ) {
		global $submenu;

		if ( ! isset( $submenu[ $slug ] ) ) {
			return;
		}

		foreach ( $submenu[ $slug ] as $i => $submenu_item ) {
			if ( array_key_exists( $submenu_item[2], $submenus_to_update ) ) {
				$submenu_item[2] = $submenus_to_update[ $submenu_item[2] ];
				// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
				$submenu[ $slug ][ $i ] = $submenu_item;
			}
		}
	}
}