import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { UserData } from 'calypso/lib/user/user';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { Step } from '../../types';
import './style.scss';

function redirect( to: string ) {
	window.location.href = to;
}

const WooVerifyEmail: Step = function WooVerifyEmail( { navigation } ) {
	const { goBack } = navigation;
	const { __ } = useI18n();
	const user = useSelector( getCurrentUser ) as UserData;

	function getContent() {
		return (
			<div className="woo-verify-email__content">
				<Button className="woo-verify-email__button" primary>
					{ __( 'Resend verification email' ) }
				</Button>
				<br />
				<Button className="woo-verify-email__link" borderless href="#">
					{ __( 'Edit email address' ) }
				</Button>
			</div>
		);
	}

	const userName = user.display_name;
	const userEmail = user.email;

	const headerText = createInterpolateElement(
		/* translators: the userName is the display name of the user, eg: Valter */
		sprintf( __( "You're all set %(userName)s! <br />We just need to verify your email." ), {
			userName,
		} ),
		{ br: createElement( 'br' ) }
	);

	const subHeaderText = createInterpolateElement(
		sprintf(
			/* translators: the userEmail is the email of the user */
			__(
				'A verification email has been sent to %(userEmail)s. <br />Please continue your journey from the link sent.'
			),
			{ userEmail }
		),
		{ br: createElement( 'br' ) }
	);

	const siteSlug = useSiteSlugParam();

	return (
		<StepContainer
			stepName={ 'woo-verify-email-step' }
			goBack={ goBack }
			goNext={ () => redirect( `/home/${ siteSlug }` ) }
			isHorizontalLayout={ false }
			skipButtonAlign={ 'top' }
			skipLabelText={ __( 'Confirm my email later' ) }
			formattedHeader={
				<FormattedHeader
					id={ 'woo-verify-email-title-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
				/>
			}
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default WooVerifyEmail;
