import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan } from '@automattic/calypso-products';
import { Button, Dialog, Gridicon, ScreenReaderText } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { CheckboxControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { THEME_TIERS } from 'calypso/components/theme-tier/constants';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import {
	acceptActivationModal,
	activate as activateTheme,
	dismissActivationModal,
} from 'calypso/state/themes/actions';
import {
	getActiveTheme,
	getCanonicalTheme,
	getThemeIdToActivate,
	getThemeTierForTheme,
	isActivatingTheme,
	isThemeActive,
	isThemeAllowedOnSite,
	shouldShowActivationModal,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './activation-modal.scss';

const SiteIntent = Onboard.SiteIntent;

export class ActivationModal extends Component {
	static propTypes = {
		source: PropTypes.oneOf( [ 'details', 'list', 'upload' ] ).isRequired,
		siteIntent: PropTypes.string,
		newTheme: PropTypes.shape( {
			id: PropTypes.string,
			name: PropTypes.string,
		} ),
		activeTheme: PropTypes.shape( {
			name: PropTypes.string,
		} ),
		isActivating: PropTypes.bool.isRequired,
		siteId: PropTypes.number,
		isVisible: PropTypes.bool,
		onClose: PropTypes.func,
		newThemeId: PropTypes.string,
		showSuccessNotice: PropTypes.bool,
	};

	constructor( props ) {
		super( props );
		const { isCurrentThemeAllowedOnSite } = props;

		this.state = {
			checkboxChecked: isCurrentThemeAllowedOnSite,
		};
	}

	onCheckboxChange = ( isChecked ) => {
		this.setState( { checkboxChecked: isChecked } );
	};

	closeModalHandler =
		( action = 'dismiss' ) =>
		() => {
			const {
				newThemeId,
				activeTheme,
				siteId,
				source,
				isCurrentThemeAllowedOnSite,
				showSuccessNotice,
			} = this.props;
			if ( 'activeTheme' === action ) {
				this.props.acceptActivationModal( newThemeId );
				const eventName = ! isCurrentThemeAllowedOnSite
					? 'calypso_theme_switch_plan_warning_accepted'
					: 'calypso_theme_autoloading_homepage_modal_activate_click';

				recordTracksEvent( eventName, {
					theme: newThemeId,
					activeTheme: activeTheme.id,
				} );
				return this.props.activateTheme( newThemeId, siteId, { source, showSuccessNotice } );
			} else if ( 'dismiss' === action ) {
				const eventName = ! isCurrentThemeAllowedOnSite
					? 'calypso_theme_switch_plan_warning_declined'
					: 'calypso_theme_autoloading_homepage_modal_dismiss';

				recordTracksEvent( eventName, {
					action: 'escape',
					theme: newThemeId,
					activeTheme: activeTheme.id,
				} );
				return this.props.dismissActivationModal();
			}
		};

	render() {
		const {
			isCurrentThemeAllowedOnSite,
			activeThemeRequiredPlan,
			newTheme,
			activeTheme,
			isActivating,
			isCurrentTheme,
			siteIntent,
			isVisible = false,
		} = this.props;

		// Nothing to do when it's the current theme.
		if ( isCurrentTheme ) {
			return null;
		}

		// Hide while is activating.
		if ( isActivating ) {
			return null;
		}

		if ( ! newTheme || ! activeTheme ) {
			return null;
		}

		const eventName = ! isCurrentThemeAllowedOnSite
			? 'calypso_theme_switch_plan_warning_modal_view'
			: 'calypso_theme_autoloading_homepage_modal_view';

		const isAIAssembler = siteIntent === SiteIntent.AIAssembler && activeTheme.id === 'assembler';
		const translationArgs = {
			args: {
				activeThemeName: activeTheme.name,
				newThemeName: newTheme.name,
			},
			components: {
				a: (
					<a
						href={ localizeUrl(
							'https://wordpress.com/support/themes/changing-themes/#what-happens-to-your-old-content'
						) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				br: <br />,
				strong: <strong />,
			},
		};

		const message = isAIAssembler
			? translate(
					'{{strong}}%(newThemeName)s{{/strong}} is currently not compatible with our AI Website Builder. Changing to this theme means you can no longer use our AI Website Builder on this site.{{br}}{{/br}}{{br}}{{/br}}Additionally, your homepage will be replaced but your content will remain accessible. {{a}}Learn more{{/a}}.',
					translationArgs
			  )
			: translate(
					'You’re about to change your active theme from {{strong}}%(activeThemeName)s{{/strong}} to {{strong}}%(newThemeName)s{{/strong}}.{{br}}{{/br}}{{br}}{{/br}}This will replace your homepage, but your content will remain accessible. {{a}}Learn more{{/a}}.',
					translationArgs
			  );

		return (
			<Dialog
				className="themes__activation-modal"
				isVisible={ isVisible }
				onClose={ this.closeModalHandler( 'dismiss' ) }
			>
				<TrackComponentView
					eventName={ eventName }
					eventProperties={ { theme: newTheme.id, activeTheme: activeTheme.id } }
				/>
				<Button
					className="themes__activation-modal-close-icon"
					borderless
					onClick={ this.closeModalHandler( 'dismiss' ) }
				>
					<Gridicon icon="cross" size={ 12 } />
					<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
				</Button>
				<div className="themes__theme-preview-wrapper">
					<h1 className="activation-modal__heading">
						{ translate( 'Activate %(themeName)s', {
							args: { themeName: newTheme.name },
						} ) }
					</h1>
					<p className="activation-modal__description">{ message }</p>
					{ ! isCurrentThemeAllowedOnSite && (
						<CheckboxControl
							className="activation-modal__lower-tier-warning"
							checked={ this.state.checkboxChecked }
							onChange={ this.onCheckboxChange }
							label={ translate(
								'I understand I will not be able to switch back to %(themeName)s without upgrading my plan.',
								{
									args: { themeName: activeTheme.name },
								}
							) }
							help={
								activeThemeRequiredPlan &&
								translate(
									"%(themeName)s is no longer included in your plan, so you won't be able to activate it again unless you upgrade to the %(plan)s plan.",
									{
										args: { plan: activeThemeRequiredPlan.getTitle(), themeName: activeTheme.name },
									}
								)
							}
						/>
					) }
					<div className="activation-modal__actions">
						<Button
							primary
							disabled={ ! this.state.checkboxChecked }
							onClick={ this.closeModalHandler( 'activeTheme' ) }
						>
							{ translate( 'Activate %(themeName)s', {
								args: { themeName: newTheme.name },
							} ) }
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const newThemeId = getThemeIdToActivate( state );
		const activeThemeId = getActiveTheme( state, siteId );
		const isCurrentThemeAllowedOnSite = isThemeAllowedOnSite( state, siteId, activeThemeId );
		const activeThemeTier = getThemeTierForTheme( state, activeThemeId );
		const activeThemeMinimumUpsellPlan = THEME_TIERS[ activeThemeTier?.slug ]?.minimumUpsellPlan;
		const activeThemeRequiredPlan =
			activeThemeMinimumUpsellPlan && getPlan( activeThemeMinimumUpsellPlan );

		return {
			siteId,
			siteDomain: getSiteDomain( state, siteId ),
			newThemeId,
			newTheme: newThemeId && getCanonicalTheme( state, siteId, newThemeId ),
			activeTheme: activeThemeId && getCanonicalTheme( state, siteId, activeThemeId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			isCurrentTheme: isThemeActive( state, newThemeId, siteId ),
			isVisible: shouldShowActivationModal( state, newThemeId ),
			isCurrentThemeAllowedOnSite,
			activeThemeRequiredPlan,
		};
	},
	{
		acceptActivationModal,
		dismissActivationModal,
		activateTheme,
		recordTracksEvent,
	}
)( ActivationModal );
