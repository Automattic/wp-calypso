/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import find from 'lodash/collection/find';
import defer from 'lodash/function/defer';
import partial from 'lodash/function/partial';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import SiteSelectorModal from 'components/site-selector-modal';
import Helper from 'lib/themes/helpers';

const ThemesSiteSelectorModal = React.createClass( {
	propTypes: {
		selectedAction: PropTypes.string.isRequired,
		selectedTheme: PropTypes.object.isRequired,
		onHide: PropTypes.func,
		actions: PropTypes.object,
		getOptions: PropTypes.func
	},

	setSiteAndAction( action, theme, site ) {
		/**
		 * Since this implies a route change, defer it in case other state
		 * changes are enqueued, e.g. setSelectedTheme.
		 */
		defer( () => {
			Helper.trackClick( 'site selector', action );
			page( '/design/' + site.slug );
			this.props.actions[ action ]( theme, site );
		} );
	},

	getUrl( action, theme, site, getOptions ) {
		var option = find( getOptions( site, theme ), { name: action } );

		if ( option ) {
			return option.url;
		}
	},

	render() {
		const {
			selectedAction: action,
			selectedTheme: theme,
			onHide,
			getOptions
		} = this.props;
		const options = getOptions( null, theme );
		const option = find( options, { name: action } );
		const isPreviewingPremium = theme.price && action === 'preview';

		return (
			<SiteSelectorModal className="themes__site-selector-modal"
				isVisible={ true }
				filter={ site => ! site.jetpack /* No Jetpack sites for now. */ }
				hide={ onHide }
				mainAction={ this.setSiteAndAction.bind( null, action, theme ) }
				getMainUrl={ partial( this.getUrl, action, theme, partial.placeholder, getOptions ) }
				mainActionLabel={ option.label }>

				<Theme isActionable={ false } { ...theme } />
				<h1>{ option.header }</h1>
				{ isPreviewingPremium &&
					<h2>{ this.translate( 'You will be able to buy the design after the preview' ) }</h2>
				}
			</SiteSelectorModal>
		);
	}
} );

export default ThemesSiteSelectorModal;
