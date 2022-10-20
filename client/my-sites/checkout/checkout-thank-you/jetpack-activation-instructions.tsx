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
					<span className="licensing-thank-you-manual-activation-instructions__step-number">1</span>
					<span>
						{ translate(
							'Go to your WP Admin Dashboard and {{strong}}add a new plugin{{/strong}}.',
							{
								components: { strong: <strong /> },
							}
						) }
					</span>
				</li>

				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">2</span>
					<span>
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
					</span>
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
