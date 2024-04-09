import { Button, ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import JetpackInstructionList from './jetpack-instruction-list';

const JetpackActivationInstructions: React.FC = () => {
	const translate = useTranslate();

	const items = useMemo(
		() => [
			{
				id: 1,
				content: translate(
					'Go to your WP Admin Dashboard and {{strong}}add a new plugin{{/strong}}.',
					{
						components: { strong: <strong /> },
					}
				),
			},
			{
				id: 2,
				content: translate(
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
				),
			},
		],
		[ translate ]
	);

	return (
		<>
			<p>{ translate( "If you don't have Jetpack installed, follow these instructions:" ) }</p>

			<JetpackInstructionList items={ items } />

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
