/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import defer from 'lodash/function/defer';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import SiteSelectorModal from 'components/site-selector-modal';
import Helper from 'lib/themes/helpers';

const ThemesSiteSelectorModal = React.createClass( {
	propTypes: {
		name: React.PropTypes.string.isRequired,
		label: React.PropTypes.string.isRequired,
		header: React.PropTypes.string.isRequired,
		selectedTheme: PropTypes.object.isRequired,
		onHide: PropTypes.func,
		action: PropTypes.func
	},

	redirectAndCallAction( site ) {
		/**
		 * Since this implies a route change, defer it in case other state
		 * changes are enqueued, e.g. setSelectedTheme.
		 */
		defer( () => {
			Helper.trackClick( 'site selector', this.props.name );
			page( '/design/' + site.slug );
			this.props.action( this.props.selectedTheme, site );
		} );
	},

	render() {
		const {
			label,
			header,
			selectedTheme: theme,
			onHide
		} = this.props;

		return (
			<SiteSelectorModal className="themes__site-selector-modal"
				isVisible={ true }
				filter={ function( site ) {
					return ! site.jetpack;
				} /* No Jetpack sites for now. */ }
				hide={ onHide }
				mainAction={ this.redirectAndCallAction }
				mainActionLabel={ label }>

				<Theme isActionable={ false } theme={ theme } />
				<h1>{ header }</h1>
			</SiteSelectorModal>
		);
	}
} );

export default ThemesSiteSelectorModal;
