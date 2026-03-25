import { Step } from '@automattic/onboarding';
import PropTypes from 'prop-types';
import { ActionButtons } from 'calypso/components/connect-screen/action-buttons';
import { BrandHeader } from 'calypso/components/connect-screen/brand-header';
import { UserCard } from 'calypso/components/connect-screen/user-card';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';

export default function SsoPartnerBranded( {
	partnerConfig,
	title,
	subtitle,
	currentUser,
	errorNotice,
	isPrimaryDisabled,
	isPrimaryLoading,
	onApproveClick,
	onReturnToSiteClick,
	onSignInDifferentUserClick,
	approveLabel,
	returnToSiteLabel,
	signInDifferentUserLabel,
	emailVerificationNoticeText,
} ) {
	return (
		<Step.CenteredColumnLayout columnWidth={ 4 } verticalAlign="center">
			<div
				className={ `jetpack-connect__sso-partner-branded jetpack-connect__sso-partner-branded--${ partnerConfig.id }` }
			>
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
						{ errorNotice }
						<EmailVerificationGate
							noticeText={ emailVerificationNoticeText }
							noticeStatus="is-info"
						>
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
								primaryClassName="jetpack-connect__sso-partner-branded-primary-button"
								primaryLabel={ approveLabel }
								primaryOnClick={ onApproveClick }
								primaryLoading={ isPrimaryLoading }
								primaryDisabled={ isPrimaryDisabled }
								secondaryClassName="jetpack-connect__sso-partner-branded-secondary-button"
								secondaryLabel={ returnToSiteLabel }
								secondaryOnClick={ onReturnToSiteClick }
								tertiaryLabel={ signInDifferentUserLabel }
								tertiaryOnClick={ onSignInDifferentUserClick }
							/>
						</EmailVerificationGate>
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
		id: PropTypes.string.isRequired,
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
