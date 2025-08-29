import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import SecurityPageHeader from '../security-page-header';

export default function SecurityConnectedApps() {
	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Connected applications' ) }
					description={ createInterpolateElement(
						__(
							'Connect with third-party applications that extend your site in new and cool ways. <link>Learn more</link>'
						),
						{
							link: (
								<InlineSupportLink
									supportPostId={ 17288 }
									// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
									supportLink="https://wordpress.com/support/third-party-applications/"
								/>
							),
						}
					) }
				/>
			}
		>
			<Text>Content goes here</Text>
		</PageLayout>
	);
}
