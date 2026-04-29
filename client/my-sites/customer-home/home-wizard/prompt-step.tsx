import {
	TextareaControl,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type Props = {
	value: string;
	onChange: ( value: string ) => void;
};

const EXAMPLE_PROMPTS = [
	'A weekly newsletter about indie game development for ~500 subscribers.',
	'A small online store selling hand-thrown ceramics, with a blog for studio updates.',
	'A portfolio for my freelance illustration work, plus a contact page for new clients.',
];

export default function PromptStep( { value, onChange }: Props ) {
	const translate = useTranslate();

	return (
		<VStack spacing={ 4 } className="home-wizard__step">
			<VStack spacing={ 2 }>
				<Heading level={ 2 } size={ 20 }>
					{ translate( 'Tell us about your site' ) }
				</Heading>
				<Text variant="muted">
					{ translate(
						'Describe what you want to build, in your own words. The more specific, the better — what kind of site, who it’s for, and what you want visitors to do.'
					) }
				</Text>
			</VStack>

			<TextareaControl
				__nextHasNoMarginBottom
				label={ translate( 'Your site, in one paragraph' ) as string }
				value={ value }
				onChange={ onChange }
				rows={ 6 }
				placeholder={
					translate(
						'e.g. A weekly newsletter about indie game development for ~500 subscribers, with paid posts via Stripe and a comments section on each issue.'
					) as string
				}
			/>

			<VStack spacing={ 2 }>
				<Text variant="muted" size={ 12 }>
					{ translate( 'Need inspiration?' ) }
				</Text>
				<ul className="home-wizard__prompt-examples">
					{ EXAMPLE_PROMPTS.map( ( example ) => (
						<li key={ example }>
							<button
								type="button"
								className="home-wizard__prompt-example"
								onClick={ () => onChange( example ) }
							>
								{ example }
							</button>
						</li>
					) ) }
				</ul>
			</VStack>
		</VStack>
	);
}
