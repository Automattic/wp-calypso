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
import i18n from 'lib/mixins/i18n';

const ThemesSiteSelectorModal = React.createClass( {
	propTypes: {
		selectedAction: PropTypes.string.isRequired,
		selectedTheme: PropTypes.object.isRequired,
		onHide: PropTypes.func,
		actions: PropTypes.object
	},

	redirectAndCallAction( site ) {
		/**
		 * Since this implies a route change, defer it in case other state
		 * changes are enqueued, e.g. setSelectedTheme.
		 */
		defer( () => {
			const {
				selectedAction: action,
				selectedTheme: theme
			} = this.props;
			Helper.trackClick( 'site selector', action );
			page( '/design/' + site.slug );
			this.props.actions[ action ]( theme, site );
		} );
	},

	getActionText( name ) {
		return {
			purchase: {
				label: i18n.translate( 'Purchase', {
					context: 'verb'
				} ),
				header: i18n.translate( 'Purchase on:', {
					context: 'verb',
					comment: 'label for selecting a site for which to purchase a theme'
				} ),
			},
			activate: {
				label: i18n.translate( 'Activate' ),
				header: i18n.translate( 'Activate on:', { comment: 'label for selecting a site on which to activate a theme' } ),
			},
			customize: {
				label: i18n.translate( 'Customize' ),
				header: i18n.translate( 'Customize on:', { comment: 'label for selecting a site for which to customize a theme' } ),
			}
		}[ name ];
	},

	render() {
		const {
			selectedAction: action,
			selectedTheme: theme,
			onHide
		} = this.props;
		const { label, header } = this.getActionText( this.props.selectedAction );
		const isPreviewingPremium = theme.price && action === 'preview';

		return (
			<SiteSelectorModal className="themes__site-selector-modal"
				isVisible={ true }
				filter={ function( site ) {
					return ! site.jetpack;
				} /* No Jetpack sites for now. */ }
				hide={ onHide }
				mainAction={ this.redirectAndCallAction }
				mainActionLabel={ label }>

				<Theme isActionable={ false } { ...theme } />
				<h1>{ header }</h1>
				{ isPreviewingPremium &&
					<h2>{ this.translate( 'You will be able to buy the design after the preview' ) }</h2>
				}
			</SiteSelectorModal>
		);
	}
} );

export default ThemesSiteSelectorModal;
