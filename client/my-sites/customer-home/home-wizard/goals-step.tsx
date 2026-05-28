import {
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { edit, tool, store, envelope, people, gallery } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import type { GoalKey } from './types';

type GoalOption = {
	key: GoalKey;
	title: string;
	description: string;
	icon: typeof edit;
};

function useGoalOptions(): GoalOption[] {
	const translate = useTranslate();
	return [
		{
			key: 'write',
			title: translate( 'Write' ),
			description: translate( 'Share your ideas, stories, or expertise.' ),
			icon: edit,
		},
		{
			key: 'build',
			title: translate( 'Build a website' ),
			description: translate( 'Create a presence for a project, business, or yourself.' ),
			icon: tool,
		},
		{
			key: 'sell',
			title: translate( 'Sell online' ),
			description: translate( 'Set up a store for digital or physical goods.' ),
			icon: store,
		},
		{
			key: 'newsletter',
			title: translate( 'Newsletter' ),
			description: translate( 'Reach subscribers directly in their inbox.' ),
			icon: envelope,
		},
		{
			key: 'educate',
			title: translate( 'Educate' ),
			description: translate( 'For schools, nonprofits, courses, or communities.' ),
			icon: people,
		},
		{
			key: 'portfolio',
			title: translate( 'Portfolio' ),
			description: translate( 'Showcase your work, projects, or creative side.' ),
			icon: gallery,
		},
	];
}

type Props = {
	value: GoalKey | null;
	onChange: ( value: GoalKey ) => void;
};

export default function GoalsStep( { value, onChange }: Props ) {
	const translate = useTranslate();
	const options = useGoalOptions();

	return (
		<VStack spacing={ 4 } className="home-wizard__step">
			<VStack spacing={ 1 }>
				<Heading level={ 2 } size={ 20 } weight={ 500 }>
					{ translate( "What's your main goal?" ) }
				</Heading>
				<Text variant="muted" size={ 13 }>
					{ translate( 'This helps us tailor your setup checklist.' ) }
				</Text>
			</VStack>
			<div className="home-wizard__cards" role="radiogroup">
				{ options.map( ( option ) => {
					const selected = value === option.key;
					return (
						<button
							key={ option.key }
							type="button"
							role="radio"
							aria-checked={ selected }
							className={ 'home-wizard__card' + ( selected ? ' is-selected' : '' ) }
							onClick={ () => onChange( option.key ) }
						>
							<Icon icon={ option.icon } size={ 20 } />
							<span className="home-wizard__card-text">
								<span className="home-wizard__card-title">{ option.title }</span>
								<span className="home-wizard__card-description">{ option.description }</span>
							</span>
						</button>
					);
				} ) }
			</div>
		</VStack>
	);
}
