import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { OptionContent } from 'calypso/components/option-content';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import attachToSite from './icons/attach-to-site.svg';
import useDomainOnly from './icons/domain-only.svg';
import addMailbox from './icons/mailbox.svg';
import startSite from './icons/start-site.svg';

import './style.scss';

export default function DomainOnlyNew() {
	const translate = useTranslate();
	const user = useSelector( getCurrentUser );

	const userHasSites = user && user.visible_site_count > 0;

	return (
		<Step.CenteredColumnLayout
			className="step-container-v2--domain-only-new domain-only-new"
			columnWidth={ 6 }
			heading={
				<Step.Heading
					text={ translate( 'Thank you for your purchase' ) }
					subText={ translate( 'Your new domain name is ready! How would you like to use it?' ) }
				/>
			}
			verticalAlign="center"
		>
			<OptionContent
				illustration={ <img src={ startSite } alt="" aria-hidden /> }
				titleText={ translate( 'Start a new site' ) }
				topText={ translate( 'Create and launch a site on WordPress.com.' ) }
				benefits={ [
					translate( '$72.00 in upgrade credits will be applied to new paid plan purchases.' ),
				] }
				onSelect={ () => {} }
			/>
			<OptionContent
				illustration={ <img src={ addMailbox } alt="" aria-hidden /> }
				titleText={ translate( 'Add a mailbox' ) }
				topText={ translate( 'Stand out with a professional email address.' ) }
				onSelect={ () => {} }
			/>
			{ userHasSites && (
				<OptionContent
					illustration={ <img src={ attachToSite } alt="" aria-hidden /> }
					titleText={ translate( 'Attach to an existing site' ) }
					topText={ translate( 'Attach your domain name to an existing WordPress.com site.' ) }
					onSelect={ () => {} }
				/>
			) }
			<OptionContent
				illustration={ <img src={ useDomainOnly } alt="" aria-hidden /> }
				titleText={ translate( 'Use the domain name only' ) }
				topText={ translate(
					"Just use the domain name as-is and add a site whenever you're ready."
				) }
				onSelect={ () => {} }
			/>
			<Step.LinkButton className="domain-only-new__migrate-link" onClick={ () => {} }>
				{ translate( 'Migrate an existing site' ) }
			</Step.LinkButton>
		</Step.CenteredColumnLayout>
	);
}
