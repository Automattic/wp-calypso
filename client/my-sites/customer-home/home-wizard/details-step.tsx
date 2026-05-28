import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import type { GoalKey } from './types';

type Props = {
	goal: GoalKey | null;
	siteName: string;
	intent: string;
	onSiteNameChange: ( value: string ) => void;
	onIntentChange: ( value: string ) => void;
};

// Topic examples grounded in the WordPress.com site classification taxonomy
// (top "Topic" labels) and the Big Sky "what users want to build" analysis:
// Small Business #1, Personal Blog #2, E-commerce #3, Portfolio #4,
// Restaurant #5, Real Estate #6, Health & Wellness #9.
// One variant is picked per mount so the example stays stable while typing
// but rotates next time the user lands on this step.
function useIntentPlaceholder( goal: GoalKey | null ): string {
	const translate = useTranslate();
	const variants = useMemo< Record< GoalKey, string[] > >(
		() => ( {
			write: [
				translate( 'e.g. A blog about home cooking and weeknight recipes.' ) as string,
				translate( 'e.g. A travel diary of weekend trips around the Mediterranean.' ) as string,
				translate( 'e.g. A personal blog about parenting a toddler.' ) as string,
				translate( 'e.g. A blog reviewing the books I read this year.' ) as string,
				translate( 'e.g. A blog about training for my first marathon.' ) as string,
			],
			build: [
				translate( 'e.g. A site for a neighborhood yoga studio.' ) as string,
				translate( 'e.g. A site for my freelance design studio.' ) as string,
				translate( 'e.g. A site for a family-run Italian restaurant.' ) as string,
				translate( 'e.g. A site for a real estate agent in Brooklyn.' ) as string,
				translate( 'e.g. A site for a small dental practice.' ) as string,
			],
			sell: [
				translate( 'e.g. A shop selling handmade ceramics.' ) as string,
				translate( 'e.g. A shop selling vintage clothing.' ) as string,
				translate( 'e.g. A shop selling digital art prints.' ) as string,
				translate( 'e.g. A shop selling homemade candles and soap.' ) as string,
				translate( 'e.g. A shop selling specialty coffee beans.' ) as string,
			],
			newsletter: [
				translate( 'e.g. A weekly newsletter about indie games.' ) as string,
				translate( 'e.g. A newsletter about local food and restaurants.' ) as string,
				translate( 'e.g. A newsletter for parents of toddlers.' ) as string,
				translate( 'e.g. A newsletter about indie tech and startups.' ) as string,
				translate( 'e.g. A monthly newsletter on personal finance for freelancers.' ) as string,
			],
			educate: [
				translate( 'e.g. A small homeschool community for new families.' ) as string,
				translate( 'e.g. A nonprofit raising awareness for ocean cleanup.' ) as string,
				translate( 'e.g. An online course about modern poetry.' ) as string,
				translate( "e.g. A site for our local church's bulletin and events." ) as string,
				translate( 'e.g. A community of urban beekeepers in Lisbon.' ) as string,
			],
			portfolio: [
				translate( 'e.g. A portfolio of my illustration work.' ) as string,
				translate( 'e.g. A portfolio of my photography projects.' ) as string,
				translate( 'e.g. A portfolio of my UX design case studies.' ) as string,
				translate( 'e.g. A portfolio of architecture projects.' ) as string,
				translate( 'e.g. A portfolio of my writing samples and clips.' ) as string,
			],
		} ),
		[ translate ]
	);

	return useMemo( () => {
		const list = goal ? variants[ goal ] : variants.write;
		return list[ Math.floor( Math.random() * list.length ) ];
	}, [ goal, variants ] );
}

export default function DetailsStep( {
	goal,
	siteName,
	intent,
	onSiteNameChange,
	onIntentChange,
}: Props ) {
	const translate = useTranslate();
	const intentPlaceholder = useIntentPlaceholder( goal );

	return (
		<VStack spacing={ 4 } className="home-wizard__step">
			<Heading level={ 2 } size={ 20 } weight={ 500 }>
				{ translate( 'Tell us about your site' ) }
			</Heading>

			<TextControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ translate( 'Name' ) as string }
				value={ siteName }
				onChange={ onSiteNameChange }
			/>

			<TextareaControl
				__nextHasNoMarginBottom
				label={ translate( 'Brief description' ) as string }
				placeholder={ intentPlaceholder }
				value={ intent }
				onChange={ onIntentChange }
				rows={ 4 }
			/>
		</VStack>
	);
}
