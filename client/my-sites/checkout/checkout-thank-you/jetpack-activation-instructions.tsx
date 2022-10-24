import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';

const JetpackActivationInstructions: React.FC = () => {
	const translate = useTranslate();

	return (
		<>
			<p>{ translate( "If you don't have Jetpack installed, follow these instructions:" ) }</p>

			<ol className="licensing-thank-you-manual-activation-instructions__list">
				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					{ translate( 'Go to your WP Admin Dashboard and {{strong}}add a new plugin{{/strong}}.', {
						components: { strong: <strong /> },
					} ) }
				</li>

				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					{ translate(
						'Search for {{link}}{{strong}}Jetpack{{/strong}}{{/link}}, install and activate.',
						{
							components: {
								strong: <strong />,
								link: (
									<Button
										plain
										href="https://wordpress.org/plugins/jetpack/"
										target="_blank"
										rel="noreferrer noopener"
									/>
								),
							},
						}
					) }
				</li>
			</ol>

			<p>
				<ExternalLink
					href="https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/"
					icon
				>
					{ translate( 'Learn more about how to install Jetpack' ) }
				</ExternalLink>
			</p>
		</>
	);
};

export default JetpackActivationInstructions;
