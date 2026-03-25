import { Step } from '@automattic/onboarding';
import { Notice } from '@wordpress/components';
import PropTypes from 'prop-types';
import { ActionButtons } from 'calypso/components/connect-screen/action-buttons';
import { BrandHeader } from 'calypso/components/connect-screen/brand-header';
import { UserCard } from 'calypso/components/connect-screen/user-card';

export default function SsoPartnerBranded( {
	partnerConfig,
	title,
	subtitle,
	currentUser,
	errorNotice,
	isEmailVerificationBlocked,
	emailVerificationNoticeText,
	isPrimaryDisabled,
	isPrimaryLoading,
	onApproveClick,
	onReturnToSiteClick,
	onSignInDifferentUserClick,
	approveLabel,
	returnToSiteLabel,
	signInDifferentUserLabel,
} ) {
	const topBarLogoConfig = partnerConfig?.compactLogo || partnerConfig?.logo;
	const topBarLogo = topBarLogoConfig?.src ? (
		<img
			src={ topBarLogoConfig.src }
			alt={ topBarLogoConfig.alt }
			width={ topBarLogoConfig.width }
			height={ topBarLogoConfig.height }
		/>
	) : undefined;

	return (
		<Step.CenteredColumnLayout
			columnWidth={ 4 }
			verticalAlign="center"
			topBar={ <Step.TopBar logo={ topBarLogo } /> }
		>
			<div className="jetpack-connect__sso-partner-branded">
				<BrandHeader
					logo={ partnerConfig?.logo?.src }
					logoAlt={ partnerConfig?.logo?.alt }
					logoWidth={ partnerConfig?.logo?.width }
					logoHeight={ partnerConfig?.logo?.height }
					title={ title }
					description={ subtitle }
				/>

				{ currentUser ? (
					<div className="jetpack-connect__sso-partner-branded-logged-in">
						{ isEmailVerificationBlocked && (
							<Notice
								status="info"
								isDismissible={ false }
								className="jetpack-connect__sso-partner-branded-email-notice"
							>
								{ emailVerificationNoticeText }
							</Notice>
						) }
						{ errorNotice }
						<UserCard
							className="jetpack-connect__sso-partner-branded-user-card"
							size="large"
							user={ {
								displayName: currentUser.display_name,
								email: currentUser.email,
								avatarUrl: currentUser.avatar_URL,
							} }
						/>
						<ActionButtons
							className="jetpack-connect__sso-partner-branded-actions"
							primaryLabel={ approveLabel }
							primaryOnClick={ onApproveClick }
							primaryLoading={ isPrimaryLoading }
							primaryDisabled={ isPrimaryDisabled }
							secondaryLabel={ returnToSiteLabel }
							secondaryOnClick={ onReturnToSiteClick }
							tertiaryLabel={ signInDifferentUserLabel }
							tertiaryOnClick={ onSignInDifferentUserClick }
						/>
					</div>
				) : (
					<div className="jetpack-connect__sso-partner-branded-logged-out-placeholder" />
				) }
			</div>
		</Step.CenteredColumnLayout>
	);
}

SsoPartnerBranded.propTypes = {
	partnerConfig: PropTypes.shape( {
		logo: PropTypes.shape( {
			src: PropTypes.string,
			alt: PropTypes.string,
			width: PropTypes.number,
			height: PropTypes.number,
		} ),
		compactLogo: PropTypes.shape( {
			src: PropTypes.string,
			alt: PropTypes.string,
			width: PropTypes.number,
			height: PropTypes.number,
		} ),
	} ).isRequired,
	title: PropTypes.node.isRequired,
	subtitle: PropTypes.node,
	currentUser: PropTypes.shape( {
		display_name: PropTypes.string,
		email: PropTypes.string,
		avatar_URL: PropTypes.string,
	} ),
	errorNotice: PropTypes.node,
	isEmailVerificationBlocked: PropTypes.bool,
	emailVerificationNoticeText: PropTypes.node,
	isPrimaryDisabled: PropTypes.bool,
	isPrimaryLoading: PropTypes.bool,
	onApproveClick: PropTypes.func.isRequired,
	onReturnToSiteClick: PropTypes.func.isRequired,
	onSignInDifferentUserClick: PropTypes.func.isRequired,
	approveLabel: PropTypes.node.isRequired,
	returnToSiteLabel: PropTypes.node.isRequired,
	signInDifferentUserLabel: PropTypes.node.isRequired,
};
