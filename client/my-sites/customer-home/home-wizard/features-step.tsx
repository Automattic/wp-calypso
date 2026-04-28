import {
	__experimentalText as Text,
	__experimentalHeading as Heading,
	Icon,
} from '@wordpress/components';
import {
	formatListBullets,
	envelope,
	store,
	commentContent,
	chartBar,
	starFilled,
	people,
	currencyDollar,
} from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import type { FeatureKey } from './types';

type FeatureOption = {
	key: FeatureKey;
	label: string;
	icon: typeof envelope;
};

function useFeatureOptions(): FeatureOption[] {
	const translate = useTranslate();
	return [
		{ key: 'forms', label: translate( 'Forms' ), icon: formatListBullets },
		{ key: 'newsletter', label: translate( 'Newsletter' ), icon: envelope },
		{ key: 'store', label: translate( 'Store' ), icon: store },
		{ key: 'comments', label: translate( 'Comments' ), icon: commentContent },
		{ key: 'analytics', label: translate( 'Analytics' ), icon: chartBar },
		{ key: 'ai-assistant', label: translate( 'AI assistant' ), icon: starFilled },
		{ key: 'memberships', label: translate( 'Memberships' ), icon: people },
		{ key: 'donations', label: translate( 'Donations' ), icon: currencyDollar },
	];
}

type Props = {
	value: FeatureKey[];
	onChange: ( value: FeatureKey[] ) => void;
};

export default function FeaturesStep( { value, onChange }: Props ) {
	const translate = useTranslate();
	const options = useFeatureOptions();

	const toggle = ( key: FeatureKey ) => {
		if ( value.includes( key ) ) {
			onChange( value.filter( ( v ) => v !== key ) );
		} else {
			onChange( [ ...value, key ] );
		}
	};

	return (
		<div className="home-wizard__step">
			<header className="home-wizard__step-header">
				<Heading level={ 2 } size={ 20 }>
					{ translate( 'Which features will you need?' ) }
				</Heading>
				<Text variant="muted">
					{ translate( 'Pick all that apply — we can always add more later.' ) }
				</Text>
			</header>
			<div className="home-wizard__chips" role="group">
				{ options.map( ( option ) => {
					const selected = value.includes( option.key );
					return (
						<button
							key={ option.key }
							type="button"
							aria-pressed={ selected }
							className={ 'home-wizard__chip' + ( selected ? ' is-selected' : '' ) }
							onClick={ () => toggle( option.key ) }
						>
							<Icon icon={ option.icon } size={ 18 } />
							<span>{ option.label }</span>
						</button>
					);
				} ) }
			</div>
		</div>
	);
}
