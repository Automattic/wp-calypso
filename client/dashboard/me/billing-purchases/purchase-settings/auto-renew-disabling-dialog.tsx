import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Component } from 'react';
import { SectionHeader } from '../../../components/section-header';
import { formatDate } from '../../../utils/datetime';
import { isAkismetTemporarySitePurchase } from '../../../utils/purchase';
import CancelAutoRenewalForm from './cancel-auto-renewal-form';
import type { Purchase } from '@automattic/api-core';

const DIALOG = {
	GENERAL: 'general',
	ATOMIC: 'atomic',
	SURVEY: 'survey',
} as const;

type DialogType = typeof DIALOG.GENERAL | typeof DIALOG.ATOMIC | typeof DIALOG.SURVEY;

interface AutoRenewDisablingDialogConnectedProps {
	isAtomicSite: boolean;
}

interface AutoRenewDisablingDialogProps {
	isVisible: boolean;
	planName: string;
	siteDomain: string;
	purchase: Purchase;
	isAtomicSite: boolean;
	locale: string;
	onConfirm: () => void;
	onClose: () => void;
}

interface AutoRenewDisablingDialogState {
	dialogType: DialogType;
	surveyHasShown: boolean;
}

type AutoRenewDisablingDialogAllProps = AutoRenewDisablingDialogProps &
	AutoRenewDisablingDialogConnectedProps;

class AutoRenewDisablingDialog extends Component<
	AutoRenewDisablingDialogAllProps,
	AutoRenewDisablingDialogState
> {
	state: AutoRenewDisablingDialogState = {
		dialogType: DIALOG.GENERAL,
		surveyHasShown: false,
	};

	getVariation() {
		const { purchase, isAtomicSite } = this.props;
		if ( purchase.is_domain_registration ) {
			return 'domain';
		}

		if ( purchase.is_plan && isAtomicSite ) {
			return 'atomic';
		}

		if ( purchase.is_plan ) {
			return 'plan';
		}

		if ( purchase.is_google_workspace_product || purchase.is_titan_mail_product ) {
			return 'email';
		}

		if ( isAkismetTemporarySitePurchase( purchase ) ) {
			return 'siteless';
		}

		return null;
	}

	getCopy( variation: string ) {
		const { planName, siteDomain, purchase, locale } = this.props;
		const expiryDate = formatDate( new Date( purchase.expiry_date ), locale, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		} );

		switch ( variation ) {
			case 'plan':
				return createInterpolateElement(
					sprintf(
						/* translators: %(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. %(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. %(expiryDate)s is a date string, e.g. May 14, 2020 */
						__(
							'By canceling auto-renewal, your <strong>%(planName)s</strong> plan for <strong>%(siteDomain)s</strong> will expire on <strong>%(expiryDate)s</strong>. ' +
								"When it does, you'll lose access to key features you may be using on your site. " +
								'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.'
						),
						{
							planName,
							siteDomain,
							expiryDate,
						}
					),
					{
						strong: <strong />,
					}
				);
			case 'domain':
				return createInterpolateElement(
					sprintf(
						/* translators: %(domain)s is a domain name, e.g. example.com, example.wordpress.com. %(expiryDate)s is a date string, e.g. May 14, 2020 */
						__(
							'By canceling auto-renewal, your domain <strong>%(domain)s</strong> will expire on <strong>%(expiryDate)s</strong>. ' +
								"Once your domain expires, there is no guarantee that you'll be able to get it back – " +
								'it could become unavailable and be impossible to purchase here, or at any other domain registrar. ' +
								'To avoid that, turn auto-renewal back on or manually renew your domain before the expiration date.'
						),
						{
							// in case of a domain registration, we need the actual domain bound to this purchase instead of the primary domain bound to the site.
							domain: purchase.meta ?? '',
							expiryDate,
						}
					),
					{
						strong: <strong />,
					}
				);
			case 'atomic':
				return createInterpolateElement(
					sprintf(
						/* translators: %(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. %(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. %(expiryDate)s is a date string, e.g. May 14, 2020 */
						__(
							'By canceling auto-renewal, your <strong>%(planName)s</strong> plan for <strong>%(siteDomain)s</strong> will expire on <strong>%(expiryDate)s</strong>. ' +
								'When it expires, plugins, themes and design customizations will be deactivated. ' +
								'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.'
						),
						{
							planName,
							siteDomain,
							expiryDate,
						}
					),
					{
						strong: <strong />,
					}
				);
			case 'email':
				return createInterpolateElement(
					sprintf(
						/* translators: %(emailProductName)s is the name of an email product, e.g. Email, Titan Mail, Google Workspace. %(domainName)s is a domain name, e.g. example.com. %(expiryDate)s is a date string, e.g. May 14, 2020 */
						__(
							'By canceling auto-renewal, your <strong>%(emailProductName)s</strong> subscription for <strong>%(domainName)s</strong> will expire on <strong>%(expiryDate)s</strong>. ' +
								'After it expires, you will not be able to send and receive emails for this domain. ' +
								'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.'
						),
						{
							domainName: purchase.meta ?? '',
							// Use the purchased product name to make sure it's correct
							emailProductName: purchase.product_name,
							expiryDate,
						}
					),
					{
						strong: <strong />,
					}
				);
			case 'siteless':
				return createInterpolateElement(
					sprintf(
						/* translators: %(productName)s is the name of an Akismet plan/ product. %(expiryDate)s is a date string, e.g. May 14, 2020 */
						__(
							'By canceling auto-renewal, your <strong>%(productName)s</strong> subscription will expire on <strong>%(expiryDate)s</strong>. ' +
								"When it does, you'll lose access to key features you may be using on your site. " +
								'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.'
						),
						{
							productName: purchase.product_name,
							expiryDate,
						}
					),
					{
						strong: <strong />,
					}
				);
			default:
				return createInterpolateElement(
					sprintf(
						/* translators: %(productName)s is the name of a WordPress.com product. %(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. %(expiryDate)s is a date string, e.g. May 14, 2020 */
						__(
							'By canceling auto-renewal, your <strong>%(productName)s</strong> subscription for <strong>%(siteDomain)s</strong> will expire on <strong>%(expiryDate)s</strong>. ' +
								"When it does, you'll lose access to key features you may be using on your site. " +
								'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.'
						),
						{
							productName: purchase.product_name,
							siteDomain,
							expiryDate,
						}
					),
					{
						strong: <strong />,
					}
				);
		}
	}

	onClickAtomicFollowUpConfirm = () => {
		this.props.onConfirm();
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
		const { isVisible, siteDomain } = this.props;
		const exportPath = '/backup/' + siteDomain;

		if ( ! isVisible ) {
			return null;
		}

		return (
			<ConfirmDialog
				onCancel={ () => ( window.location.href = exportPath ) }
				onConfirm={ this.onClickAtomicFollowUpConfirm }
				cancelButtonText={ __( 'Download content' ) }
				confirmButtonText={ __( 'Turn off auto-renew' ) }
			>
				<SectionHeader
					title={ __( 'Download your content' ) }
					description={ __(
						'Before you continue, we recommend downloading a backup of your site—that way, you’ll have your content to use on any future websites.'
					) }
				/>
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

		this.props.onConfirm();

		if ( this.state.surveyHasShown ) {
			return this.closeAndCleanup();
		}

		this.setState( {
			dialogType: DIALOG.SURVEY,
			surveyHasShown: true,
		} );
	};

	renderGeneralDialog = () => {
		const { isVisible } = this.props;
		const description = this.getCopy( this.getVariation() ?? '' );

		if ( ! isVisible ) {
			return null;
		}

		return (
			<ConfirmDialog
				onCancel={ this.closeAndCleanup }
				onConfirm={ this.onClickGeneralConfirm }
				cancelButtonText={ __( 'Keep auto-renew on' ) }
				confirmButtonText={ __( 'Turn off auto-renew' ) }
			>
				<SectionHeader title={ __( 'Turn off auto-renew' ) } description={ description } />
			</ConfirmDialog>
		);
	};

	renderSurvey = () => {
		const { purchase, isVisible } = this.props;

		return (
			<CancelAutoRenewalForm
				purchase={ purchase }
				selectedSiteId={ purchase.blog_id }
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

export default AutoRenewDisablingDialog;
