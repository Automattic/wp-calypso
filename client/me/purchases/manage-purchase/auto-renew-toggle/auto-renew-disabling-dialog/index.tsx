import {
	isDomainRegistration,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isTitanMail,
	WPCOM_FEATURES_SUBSCRIPTION_GIFTING,
} from '@automattic/calypso-products';
import { Button, CheckboxControl } from '@wordpress/components';
import { localize, type LocalizeProps } from 'i18n-calypso';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import { ConfirmDialog, DialogContent, DialogFooter } from 'calypso/components/confirm-dialog';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import CancelAutoRenewalForm from 'calypso/components/marketing-survey/cancel-auto-renewal-form';
import { isAkismetHoldingSitePurchase } from 'calypso/me/purchases/utils';
import { createNotice } from 'calypso/state/notices/actions';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import type { Purchases } from '@automattic/data-stores';
import type { NoticeStatus, NoticeText, NoticeOptions } from 'calypso/state/notices/types';
import type { IAppState } from 'calypso/state/types';

const DIALOG = {
	GENERAL: 'general',
	ATOMIC: 'atomic',
	SURVEY: 'survey',
} as const;

type DialogType = typeof DIALOG.GENERAL | typeof DIALOG.ATOMIC | typeof DIALOG.SURVEY;

interface MomentProps {
	moment: typeof moment;
}

interface AutoRenewDisablingDialogConnectedProps {
	isAtomicSite: boolean;
	siteId: number;
	canShowGiftingOptIn: boolean;
	currentGiftingValue: boolean;
	saveSiteSettings: ( siteId: number, settings: Record< string, unknown > ) => Promise< unknown >;
	createNotice: ( status: NoticeStatus, text: NoticeText, options?: NoticeOptions ) => void;
}

interface AutoRenewDisablingDialogProps {
	isVisible: boolean;
	planName: string;
	siteDomain: string;
	purchase: Purchases.Purchase;
	// `afterSuccess` is invoked by the parent's auto-renew thunk only when the
	// disable call actually succeeds. Used to chain the gift-setting save.
	onConfirm: ( afterSuccess?: () => void ) => void;
	onClose: () => void;
}

interface AutoRenewDisablingDialogState {
	dialogType: DialogType;
	surveyHasShown: boolean;
	giftingChecked: boolean;
	userEditedGifting: boolean;
}

type AutoRenewDisablingDialogAllProps = AutoRenewDisablingDialogProps &
	AutoRenewDisablingDialogConnectedProps &
	LocalizeProps &
	MomentProps;

class AutoRenewDisablingDialog extends Component<
	AutoRenewDisablingDialogAllProps,
	AutoRenewDisablingDialogState
> {
	state: AutoRenewDisablingDialogState = {
		dialogType: DIALOG.GENERAL,
		surveyHasShown: false,
		giftingChecked: this.props.currentGiftingValue,
		userEditedGifting: false,
	};

	componentDidUpdate( prevProps: AutoRenewDisablingDialogAllProps ) {
		// The visibility transition guard prevents infinite re-render loops.
		if ( ! prevProps.isVisible && this.props.isVisible ) {
			/* eslint-disable-next-line react/no-did-update-set-state */
			this.setState( {
				giftingChecked: this.props.currentGiftingValue,
				userEditedGifting: false,
			} );
			return;
		}
		if (
			this.props.isVisible &&
			! this.state.userEditedGifting &&
			prevProps.currentGiftingValue !== this.props.currentGiftingValue
		) {
			/* eslint-disable-next-line react/no-did-update-set-state */
			this.setState( { giftingChecked: this.props.currentGiftingValue } );
		}
	}

	commitGiftingChange = () => {
		const { canShowGiftingOptIn, currentGiftingValue, siteId, translate } = this.props;
		if ( ! canShowGiftingOptIn ) {
			return;
		}
		if ( this.state.giftingChecked === currentGiftingValue ) {
			return;
		}
		// The thunk catches its own rejection and returns the error, so detect
		// failure by the absence of `updated` in the resolved body.
		Promise.resolve(
			this.props.saveSiteSettings( siteId, {
				wpcom_gifting_subscription: this.state.giftingChecked,
			} )
		).then( ( result: unknown ) => {
			const isSuccess =
				!! result && typeof result === 'object' && 'updated' in ( result as object );
			if ( ! isSuccess ) {
				this.props.createNotice(
					'is-error',
					translate(
						"We couldn't update your gift subscription preference. You can change it later in your site settings."
					)
				);
			}
		} );
	};

	getVariation() {
		const { purchase, isAtomicSite } = this.props;
		if ( isDomainRegistration( purchase ) ) {
			return 'domain';
		}

		if ( isPlan( purchase ) && isAtomicSite ) {
			return 'atomic';
		}

		if ( isPlan( purchase ) ) {
			return 'plan';
		}

		if ( isGSuiteOrGoogleWorkspace( purchase ) || isTitanMail( purchase ) ) {
			return 'email';
		}

		if ( isAkismetHoldingSitePurchase( purchase ) ) {
			return 'siteless';
		}

		return null;
	}

	getCopy( variation: string ) {
		const { planName, siteDomain, purchase, translate, moment } = this.props;
		const expiryDate = moment( purchase.expiryDate ).format( 'LL' );

		switch ( variation ) {
			case 'plan':
				return translate(
					'By canceling auto-renewal, your {{strong}}%(planName)s{{/strong}} plan for {{strong}}%(siteDomain)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						"When it does, you'll lose access to key features you may be using on your site. " +
						'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.',
					{
						args: {
							planName,
							siteDomain,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'domain':
				return translate(
					'By canceling auto-renewal, your domain {{strong}}%(domain)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						"Once your domain expires, there is no guarantee that you'll be able to get it back – " +
						'it could become unavailable and be impossible to purchase here, or at any other domain registrar. ' +
						'To avoid that, turn auto-renewal back on or manually renew your domain before the expiration date.',
					{
						args: {
							// in case of a domain registration, we need the actual domain bound to this purchase instead of the primary domain bound to the site.
							domain: purchase.meta ?? '',
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(domain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'atomic':
				return translate(
					'By canceling auto-renewal, your {{strong}}%(planName)s{{/strong}} plan for {{strong}}%(siteDomain)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						'When it expires, plugins, themes and design customizations will be deactivated. ' +
						'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.',
					{
						args: {
							planName,
							siteDomain,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'email':
				return translate(
					'By canceling auto-renewal, your {{strong}}%(emailProductName)s{{/strong}} subscription for {{strong}}%(domainName)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						'After it expires, you will not be able to send and receive emails for this domain. ' +
						'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.',
					{
						args: {
							domainName: purchase.meta ?? '',
							// Use the purchased product name to make sure it's correct
							emailProductName: purchase.productName,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(emailProductName)s is the name of an email product, e.g. Email, Titan Mail, Google Workspace. ' +
							'%(domainName)s is a domain name, e.g. example.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'siteless':
				return translate(
					'By canceling auto-renewal, your {{strong}}%(productName)s{{/strong}} subscription will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						"When it does, you'll lose access to key features you may be using on your site. " +
						'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.',
					{
						args: {
							productName: purchase.productName,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(productName)s is the name of an Akismet plan/ product. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			default:
				return translate(
					'By canceling auto-renewal, your {{strong}}%(productName)s{{/strong}} subscription for {{strong}}%(siteDomain)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						"When it does, you'll lose access to key features you may be using on your site. " +
						'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.',
					{
						args: {
							productName: purchase.productName,
							siteDomain,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(productName)s is the name of a WordPress.com product. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
		}
	}

	onClickAtomicFollowUpConfirm = () => {
		this.props.onConfirm( this.commitGiftingChange );
		this.setState( {
			dialogType: DIALOG.SURVEY,
		} );
	};

	closeAndCleanup = () => {
		this.props.onClose();

		// It is intentional that we don't reset `surveyHasShown` flag here.
		// That state is for preventing the survey from showing excessively.
		// The current behavior is that it won't show up until this component has been unmounted and then remounted.
		this.setState( {
			dialogType: DIALOG.GENERAL,
		} );
	};

	renderAtomicFollowUpDialog = () => {
		const { translate, isVisible, siteDomain } = this.props;
		const exportPath = '/backup/' + siteDomain;

		if ( ! isVisible ) {
			return null;
		}

		return (
			<ConfirmDialog
				onRequestClose={ this.closeAndCleanup }
				title={ translate( 'Download your content' ) }
			>
				<DialogContent>
					<p>
						{ translate(
							'Before you continue, we recommend downloading a backup of your site—that way, you’ll have your content to use on any future websites.'
						) }
					</p>
				</DialogContent>

				<DialogFooter>
					<Button onClick={ this.onClickAtomicFollowUpConfirm } variant="tertiary">
						{ translate( 'Turn off auto-renew' ) }
					</Button>
					<Button href={ exportPath } variant="primary">
						{ translate( 'Download content' ) }
					</Button>
				</DialogFooter>
			</ConfirmDialog>
		);
	};

	onClickGeneralConfirm = () => {
		if ( 'atomic' === this.getVariation() ) {
			this.setState( {
				dialogType: DIALOG.ATOMIC,
			} );
			return;
		}

		this.props.onConfirm( this.commitGiftingChange );

		if ( this.state.surveyHasShown ) {
			return this.closeAndCleanup();
		}

		this.setState( {
			dialogType: DIALOG.SURVEY,
			surveyHasShown: true,
		} );
	};

	renderGiftingOptIn = () => {
		const { canShowGiftingOptIn, translate } = this.props;
		const variation = this.getVariation();

		// Surface the gift toggle on every disable so the user can confirm or
		// change the gift-banner state in the same step.
		if ( ! canShowGiftingOptIn || ( variation !== 'plan' && variation !== 'atomic' ) ) {
			return null;
		}

		return (
			<CheckboxControl
				__nextHasNoMarginBottom
				checked={ this.state.giftingChecked }
				onChange={ ( checked: boolean ) =>
					this.setState( { giftingChecked: checked, userEditedGifting: true } )
				}
				label={ translate( 'Allow site visitors to gift your plan and domain renewal costs' ) }
				help={ translate( '{{a}}Learn more{{/a}}', {
					components: {
						a: <InlineSupportLink supportContext="gift-a-subscription" showIcon={ false } />,
					},
				} ) }
			/>
		);
	};

	renderGeneralDialog = () => {
		const { isVisible, translate } = this.props;
		const description = this.getCopy( this.getVariation() ?? '' );

		if ( ! isVisible ) {
			return null;
		}

		return (
			<ConfirmDialog
				onRequestClose={ this.closeAndCleanup }
				title={ translate( 'Turn off auto-renew' ) }
			>
				<DialogContent>
					<p>{ description }</p>
					{ this.renderGiftingOptIn() }
				</DialogContent>

				<DialogFooter>
					<Button onClick={ this.closeAndCleanup } variant="tertiary">
						{ translate( 'Keep auto-renew on' ) }
					</Button>
					<Button onClick={ this.onClickGeneralConfirm } variant="primary">
						{ translate( 'Turn off auto-renew' ) }
					</Button>
				</DialogFooter>
			</ConfirmDialog>
		);
	};

	renderSurvey = () => {
		const { purchase, isVisible } = this.props;

		return (
			<CancelAutoRenewalForm
				purchase={ purchase }
				selectedSiteId={ purchase.siteId }
				isVisible={ isVisible }
				onClose={ this.closeAndCleanup }
			/>
		);
	};

	render() {
		switch ( this.state.dialogType ) {
			case DIALOG.GENERAL:
				return this.renderGeneralDialog();
			case DIALOG.ATOMIC:
				return this.renderAtomicFollowUpDialog();
			case DIALOG.SURVEY:
				return this.renderSurvey();
		}
	}
}

export default connect(
	( state: IAppState, { purchase }: AutoRenewDisablingDialogProps ) => {
		const siteId = purchase.siteId;
		const settings = getSiteSettings( state, siteId );
		const hasGiftingFeature = siteHasFeature( state, siteId, WPCOM_FEATURES_SUBSCRIPTION_GIFTING );
		const isStaging = isSiteWpcomStaging( state, siteId );
		return {
			isAtomicSite: isSiteAtomic( state, siteId ) ?? false,
			siteId,
			canShowGiftingOptIn: Boolean( siteId ) && hasGiftingFeature && ! isStaging,
			currentGiftingValue: Boolean( settings?.wpcom_gifting_subscription ),
		};
	},
	{ saveSiteSettings, createNotice }
)( localize( withLocalizedMoment( AutoRenewDisablingDialog ) ) );
