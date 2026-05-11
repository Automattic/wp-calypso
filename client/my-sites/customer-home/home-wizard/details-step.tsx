import {
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	Button,
	Dropdown,
	MenuGroup,
	MenuItem,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

type Props = {
	siteName: string;
	intent: string;
	onSiteNameChange: ( value: string ) => void;
	onIntentChange: ( value: string ) => void;
};

type Preset = {
	key: string;
	label: string;
	prompt: string;
};

function usePresets(): Preset[] {
	const translate = useTranslate();
	return [
		{
			key: 'blog',
			label: translate( 'Blog' ) as string,
			prompt: translate(
				'A personal blog with long-form posts, a clean reading layout, and an email signup so readers can follow along.'
			) as string,
		},
		{
			key: 'newsletter',
			label: translate( 'Newsletter' ) as string,
			prompt: translate(
				'A weekly newsletter with paid subscriptions, an archive of past issues, and an email signup on the homepage.'
			) as string,
		},
		{
			key: 'store',
			label: translate( 'Store' ) as string,
			prompt: translate(
				'An online store with product pages, a shopping cart and checkout, and a homepage that highlights featured items.'
			) as string,
		},
		{
			key: 'portfolio',
			label: translate( 'Portfolio' ) as string,
			prompt: translate(
				'A portfolio with project pages organized by category, a short bio, and a contact form for inquiries.'
			) as string,
		},
		{
			key: 'photography',
			label: translate( 'Photography' ) as string,
			prompt: translate(
				'A photography site with image galleries organized by series, a short bio, and a contact form for clients.'
			) as string,
		},
		{
			key: 'nonprofit',
			label: translate( 'Nonprofit' ) as string,
			prompt: translate(
				'A nonprofit site with a mission page, a donations page, volunteer sign-ups, and a news section for updates.'
			) as string,
		},
		{
			key: 'business',
			label: translate( 'Small business' ) as string,
			prompt: translate(
				'A small business site with a homepage, services page, About page, and a contact form for customers.'
			) as string,
		},
		{
			key: 'course',
			label: translate( 'Course / membership' ) as string,
			prompt: translate(
				'A course site with lessons organized into modules, paid memberships, and a free intro lesson on the homepage.'
			) as string,
		},
	];
}

export default function DetailsStep( {
	siteName,
	intent,
	onSiteNameChange,
	onIntentChange,
}: Props ) {
	const translate = useTranslate();
	const presets = usePresets();

	return (
		<VStack spacing={ 4 } className="home-wizard__step">
			<VStack spacing={ 1 }>
				<Heading level={ 2 } size={ 20 }>
					{ translate( "Let's personalize your site" ) }
				</Heading>
				<Text variant="muted" size={ 13 }>
					{ translate(
						"Give your site a name and describe what you're making — we'll tailor your checklist."
					) }
				</Text>
			</VStack>

			<TextControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ translate( 'Site name' ) as string }
				placeholder={ translate( 'e.g. Kaonashi, Salty Hours, Mira Studio' ) as string }
				value={ siteName }
				onChange={ onSiteNameChange }
			/>

			<div className="home-wizard__textarea-wrap">
				<TextareaControl
					__nextHasNoMarginBottom
					label={ translate( 'Describe your site' ) as string }
					placeholder={
						translate(
							'A weekly newsletter about indie games, with paid subscriptions and a homepage signup.'
						) as string
					}
					value={ intent }
					onChange={ onIntentChange }
					rows={ 4 }
				/>
				<div className="home-wizard__presets">
					<Dropdown
						popoverProps={ { placement: 'top-end' } }
						renderToggle={ ( { isOpen, onToggle } ) => (
							<Button
								size="compact"
								variant="tertiary"
								onClick={ onToggle }
								aria-expanded={ isOpen }
								icon={ chevronDown }
								iconPosition="right"
								className="home-wizard__presets-toggle"
							>
								{ translate( 'Presets' ) }
							</Button>
						) }
						renderContent={ ( { onClose } ) => (
							<MenuGroup>
								{ presets.map( ( preset ) => (
									<MenuItem
										key={ preset.key }
										onClick={ () => {
											onIntentChange( preset.prompt );
											onClose();
										} }
									>
										{ preset.label }
									</MenuItem>
								) ) }
							</MenuGroup>
						) }
					/>
				</div>
			</div>
		</VStack>
	);
}
