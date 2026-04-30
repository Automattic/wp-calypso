import {
	Button,
	TextareaControl,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type Props = {
	value: string;
	onChange: ( value: string ) => void;
};

const EXAMPLE_PROMPTS: { label: string; prompt: string }[] = [
	{
		label: 'Personal blog',
		prompt:
			'A personal blog with long-form posts, a clean reading layout, and an email signup so readers can follow new posts.',
	},
	{
		label: 'Online store',
		prompt:
			'An online store with product pages, a shopping cart and checkout, and a homepage that highlights featured items.',
	},
	{
		label: 'Photography portfolio',
		prompt:
			'A photography portfolio with image galleries organized by project, a short bio, and a contact form for inquiries.',
	},
	{
		label: 'Small business site',
		prompt:
			'A small business site with a homepage, services page, About page, and a contact form for customers.',
	},
	{
		label: 'Newsletter',
		prompt:
			'A weekly newsletter with paid subscriptions, an archive of past issues, and an email signup on the homepage.',
	},
	{
		label: 'Nonprofit site',
		prompt:
			'A nonprofit site with a mission page, a donations page, volunteer sign-ups, and a news section for updates.',
	},
	{
		label: 'News publication',
		prompt:
			'A news publication with a homepage of latest stories, category pages by topic, author bylines, and email subscriptions.',
	},
	{
		label: 'Course site',
		prompt:
			'A course site with lessons organized into modules, paid memberships, and a free intro lesson on the homepage.',
	},
];

export default function PromptStep( { value, onChange }: Props ) {
	const translate = useTranslate();

	return (
		<VStack spacing={ 4 } className="home-wizard__step">
			<VStack spacing={ 1 }>
				<Heading level={ 2 } size={ 20 }>
					{ translate( 'Describe your site' ) }
				</Heading>
				<Text variant="muted" size={ 13 }>
					{ translate( "Describe your own idea — we'll tailor tips to your onboarding." ) }
				</Text>
			</VStack>

			<TextareaControl
				__nextHasNoMarginBottom
				label={ translate( 'In one sentence' ) as string }
				hideLabelFromVision
				value={ value }
				onChange={ onChange }
				rows={ 4 }
				placeholder={
					translate(
						'A weekly newsletter about indie games, with paid subscriptions and a homepage signup.'
					) as string
				}
			/>

			<VStack spacing={ 2 }>
				<Text variant="muted" size={ 12 }>
					{ translate( 'Or try one of these:' ) }
				</Text>
				<HStack
					className="home-wizard__prompt-chips"
					alignment="center"
					justify="flex-start"
					wrap
					spacing={ 2 }
				>
					{ EXAMPLE_PROMPTS.map( ( example ) => (
						<Button
							key={ example.label }
							variant="tertiary"
							size="compact"
							className="home-wizard__prompt-chip"
							onClick={ () => onChange( example.prompt ) }
						>
							{ example.label }
						</Button>
					) ) }
				</HStack>
			</VStack>
		</VStack>
	);
}
