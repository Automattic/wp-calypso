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
	'A weekly newsletter about indie game development.',
	'A small online store selling hand-thrown ceramics.',
	'A portfolio for my freelance illustration work.',
];

export default function PromptStep( { value, onChange }: Props ) {
	const translate = useTranslate();

	return (
		<VStack spacing={ 4 } className="home-wizard__step">
			<Heading level={ 2 } size={ 20 }>
				{ translate( 'Tell us about your site' ) }
			</Heading>

			<TextareaControl
				__nextHasNoMarginBottom
				label={ translate( 'In one sentence' ) as string }
				hideLabelFromVision
				value={ value }
				onChange={ onChange }
				rows={ 4 }
				placeholder={ translate( 'A weekly newsletter about indie game development…' ) as string }
			/>

			<VStack spacing={ 1 }>
				<Text variant="muted" size={ 12 }>
					{ translate( 'Try one of these:' ) }
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
