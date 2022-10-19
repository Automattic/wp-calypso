import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import ExternalLink from 'calypso/components/external-link';

const JetpackActivationInstructions: FC = () => {
	const translate = useTranslate();

	return (
		<>
			<p>{ translate( "If you don't have Jetpack installed, follow these instructions:" ) }</p>

			<ul className="licensing-thank-you-manual-activation-instructions__list">
				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">1</span>
					<span>
						{ ' ' }
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
						{ translate( 'Search for {{strong}}Jetpack{{/strong}}, install and activate.', {
							components: { strong: <strong /> },
						} ) }
					</span>
				</li>
			</ul>

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
