import { userPreferencesMutation, rawUserPreferencesQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import clsx from 'clsx';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';

import './style.scss';

type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

// Inline SVG illustrations - matching actual UI screenshots
const AllSitesIllustration = () => (
	<svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
		{ /* Background */ }
		<rect width="280" height="180" rx="8" fill="#F6F7F7" />
		{ /* Header */ }
		<rect x="12" y="12" width="32" height="12" rx="2" fill="#1E1E1E" />
		<rect x="230" y="10" width="40" height="16" rx="4" fill="#1289DB" />
		{ /* Search bar */ }
		<rect
			x="12"
			y="32"
			width="80"
			height="16"
			rx="4"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		{ /* Site Card 1 - Beach photo style */ }
		<g>
			<rect
				x="12"
				y="56"
				width="60"
				height="76"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="14" y="58" width="56" height="36" rx="2" fill="#87CEEB" />
			<rect x="14" y="78" width="56" height="16" fill="#C2B280" />
			<rect x="16" y="98" width="36" height="5" rx="1" fill="#1E1E1E" />
			<rect x="16" y="105" width="48" height="3" rx="1" fill="#A7AAAD" />
			<rect x="16" y="112" width="24" height="3" rx="1" fill="#DCDCDE" />
			<rect x="16" y="118" width="20" height="3" rx="1" fill="#DCDCDE" />
			<rect x="16" y="124" width="28" height="3" rx="1" fill="#DCDCDE" />
		</g>
		{ /* Site Card 2 - P2 style */ }
		<g>
			<rect
				x="78"
				y="56"
				width="60"
				height="76"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="80" y="58" width="56" height="36" rx="2" fill="#F7F7F7" />
			<rect x="84" y="62" width="32" height="4" rx="1" fill="#1E1E1E" />
			<rect x="120" y="62" width="12" height="6" rx="2" fill="#117AC9" />
			<rect x="84" y="70" width="48" height="3" rx="1" fill="#DCDCDE" />
			<rect x="84" y="76" width="40" height="3" rx="1" fill="#DCDCDE" />
			<rect x="82" y="98" width="40" height="5" rx="1" fill="#1E1E1E" />
			<rect x="82" y="105" width="52" height="3" rx="1" fill="#A7AAAD" />
			<rect x="82" y="112" width="24" height="3" rx="1" fill="#DCDCDE" />
			<rect x="82" y="118" width="20" height="3" rx="1" fill="#DCDCDE" />
			<rect x="82" y="124" width="28" height="3" rx="1" fill="#DCDCDE" />
		</g>
		{ /* Site Card 3 - Block Art Museum style */ }
		<g>
			<rect
				x="144"
				y="56"
				width="60"
				height="76"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="146" y="58" width="56" height="36" rx="2" fill="#FDF4F7" />
			<rect x="150" y="64" width="28" height="10" rx="1" fill="#D4576B" />
			<rect x="150" y="76" width="20" height="6" rx="1" fill="#D4576B" />
			<circle cx="188" cy="80" r="10" fill="#FFD4E0" />
			<rect x="148" y="98" width="36" height="5" rx="1" fill="#1E1E1E" />
			<rect x="148" y="105" width="54" height="3" rx="1" fill="#A7AAAD" />
			<rect x="148" y="112" width="24" height="3" rx="1" fill="#DCDCDE" />
			<rect x="148" y="118" width="20" height="3" rx="1" fill="#DCDCDE" />
			<rect x="148" y="124" width="28" height="3" rx="1" fill="#DCDCDE" />
		</g>
		{ /* Site Card 4 - Hello World style */ }
		<g>
			<rect
				x="210"
				y="56"
				width="60"
				height="76"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="212" y="58" width="56" height="36" rx="2" fill="white" />
			<rect x="216" y="66" width="32" height="6" rx="1" fill="#1289DB" />
			<rect x="216" y="76" width="44" height="3" rx="1" fill="#DCDCDE" />
			<rect x="216" y="82" width="36" height="3" rx="1" fill="#DCDCDE" />
			<rect x="214" y="98" width="44" height="5" rx="1" fill="#1E1E1E" />
			<rect x="214" y="105" width="52" height="3" rx="1" fill="#A7AAAD" />
			<rect x="214" y="112" width="24" height="3" rx="1" fill="#DCDCDE" />
			<rect x="214" y="118" width="20" height="3" rx="1" fill="#DCDCDE" />
			<rect x="214" y="124" width="28" height="3" rx="1" fill="#DCDCDE" />
		</g>
	</svg>
);

const PrimarySiteIllustration = () => (
	<svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
		{ /* Background */ }
		<rect width="280" height="180" rx="8" fill="#F6F7F7" />
		{ /* Header with site name */ }
		<rect x="12" y="8" width="100" height="14" rx="2" fill="#1E1E1E" />
		<rect x="12" y="26" width="140" height="4" rx="1" fill="#A7AAAD" />
		{ /* Site Preview - Dark blue theme */ }
		<rect x="12" y="38" width="72" height="100" rx="6" fill="#0A4B78" />
		<rect x="20" y="48" width="56" height="6" rx="1" fill="white" opacity="0.3" />
		<rect x="20" y="62" width="40" height="8" rx="1" fill="white" opacity="0.9" />
		<rect x="20" y="74" width="50" height="4" rx="1" fill="white" opacity="0.5" />
		<rect x="20" y="100" width="22" height="10" rx="3" fill="#3858E9" />
		<rect x="46" y="100" width="22" height="10" rx="3" fill="#50575E" />
		<rect x="20" y="122" width="48" height="3" rx="1" fill="white" opacity="0.3" />
		{ /* Status Card - Visibility (green check) */ }
		<g>
			<rect
				x="92"
				y="38"
				width="56"
				height="44"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="104" cy="52" r="6" fill="#00BA37" opacity="0.15" />
			<path
				d="M101 52L103 54L107 50"
				stroke="#00BA37"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<rect x="98" y="64" width="36" height="4" rx="1" fill="#A7AAAD" />
			<rect x="98" y="72" width="28" height="6" rx="1" fill="#1E1E1E" />
		</g>
		{ /* Status Card - Performance */ }
		<g>
			<rect
				x="154"
				y="38"
				width="56"
				height="44"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="166" y="48" width="14" height="14" rx="2" fill="#E8F0FE" />
			<rect x="168" y="56" width="4" height="6" rx="1" fill="#1289DB" />
			<rect x="174" y="52" width="4" height="10" rx="1" fill="#1289DB" />
			<rect x="160" y="64" width="40" height="4" rx="1" fill="#A7AAAD" />
			<rect x="160" y="72" width="32" height="6" rx="1" fill="#1E1E1E" />
		</g>
		{ /* Status Card - Plan */ }
		<g>
			<rect
				x="216"
				y="38"
				width="56"
				height="44"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="228" cy="52" r="6" fill="#1289DB" opacity="0.15" />
			<rect x="225" y="50" width="6" height="4" rx="1" fill="#1289DB" />
			<rect x="222" y="64" width="36" height="4" rx="1" fill="#A7AAAD" />
			<rect x="222" y="72" width="28" height="6" rx="1" fill="#1E1E1E" />
		</g>
		{ /* Status Card - Last Backup */ }
		<g>
			<rect
				x="92"
				y="90"
				width="56"
				height="44"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="104" cy="104" r="6" fill="#DCDCDE" />
			<rect x="102" y="102" width="4" height="5" rx="1" fill="#50575E" />
			<rect x="98" y="116" width="36" height="4" rx="1" fill="#A7AAAD" />
			<rect x="98" y="124" width="28" height="6" rx="1" fill="#1E1E1E" />
		</g>
		{ /* Status Card - Last Scan (green check) */ }
		<g>
			<rect
				x="154"
				y="90"
				width="56"
				height="44"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<circle cx="166" cy="104" r="6" fill="#00BA37" opacity="0.15" />
			<path
				d="M163 104L165 106L169 102"
				stroke="#00BA37"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<rect x="160" y="116" width="40" height="4" rx="1" fill="#A7AAAD" />
			<rect x="160" y="124" width="32" height="6" rx="1" fill="#1E1E1E" />
		</g>
		{ /* Status Card - Storage */ }
		<g>
			<rect
				x="216"
				y="90"
				width="56"
				height="44"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			<rect x="222" y="100" width="44" height="4" rx="2" fill="#DCDCDE" />
			<rect x="222" y="100" width="16" height="4" rx="2" fill="#00BA37" />
			<rect x="222" y="110" width="28" height="4" rx="1" fill="#A7AAAD" />
			<rect x="222" y="118" width="20" height="6" rx="1" fill="#1E1E1E" />
			<rect x="222" y="128" width="44" height="4" rx="2" fill="#DCDCDE" />
			<rect x="222" y="128" width="4" height="4" rx="2" fill="#00BA37" />
		</g>
	</svg>
);

const ReaderIllustration = () => (
	<svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
		{ /* Background */ }
		<rect width="280" height="180" rx="8" fill="#F6F7F7" />
		{ /* Sidebar */ }
		<rect x="0" y="0" width="56" height="180" rx="8" fill="white" />
		<rect width="48" height="180" fill="white" />
		{ /* Reader title in sidebar */ }
		<rect x="8" y="12" width="36" height="10" rx="2" fill="#1E1E1E" />
		{ /* Sidebar nav items */ }
		<rect x="8" y="32" width="40" height="8" rx="4" fill="#E8F0FE" />
		<rect x="12" y="34" width="32" height="4" rx="1" fill="#1289DB" />
		<rect x="8" y="46" width="28" height="5" rx="1" fill="#A7AAAD" />
		<rect x="8" y="56" width="32" height="5" rx="1" fill="#A7AAAD" />
		<rect x="8" y="66" width="24" height="5" rx="1" fill="#A7AAAD" />
		<rect x="8" y="76" width="36" height="5" rx="1" fill="#A7AAAD" />
		<rect x="8" y="86" width="20" height="5" rx="1" fill="#A7AAAD" />
		<rect x="8" y="96" width="26" height="5" rx="1" fill="#A7AAAD" />
		{ /* Main content area */ }
		<rect x="64" y="12" width="40" height="8" rx="2" fill="#1E1E1E" />
		<rect x="64" y="24" width="80" height="4" rx="1" fill="#A7AAAD" />
		{ /* Write quick post bar */ }
		<rect
			x="64"
			y="36"
			width="204"
			height="16"
			rx="4"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<rect x="72" y="42" width="60" height="4" rx="1" fill="#A7AAAD" />
		{ /* Post Card 1 - with photo avatar */ }
		<g>
			<rect
				x="64"
				y="58"
				width="204"
				height="54"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			{ /* Avatar - photo style */ }
			<circle cx="82" cy="76" r="10" fill="#D4A574" />
			<circle cx="82" cy="73" r="4" fill="#F5E6D3" />
			<ellipse cx="82" cy="80" rx="5" ry="3" fill="#8B7355" />
			{ /* Author info */ }
			<rect x="98" y="68" width="50" height="5" rx="1" fill="#1E1E1E" />
			<rect x="98" y="76" width="70" height="3" rx="1" fill="#A7AAAD" />
			{ /* Post title */ }
			<rect x="98" y="86" width="140" height="6" rx="1" fill="#1E1E1E" />
			{ /* Excerpt */ }
			<rect x="98" y="96" width="160" height="4" rx="1" fill="#A7AAAD" />
			{ /* Action buttons */ }
			<rect x="230" y="68" width="12" height="8" rx="2" fill="#DCDCDE" />
			<rect x="246" y="68" width="12" height="8" rx="2" fill="#DCDCDE" />
		</g>
		{ /* Post Card 2 - with different avatar */ }
		<g>
			<rect
				x="64"
				y="118"
				width="204"
				height="54"
				rx="4"
				fill="white"
				stroke="#DCDCDE"
				strokeWidth="1"
			/>
			{ /* Avatar - blue tint */ }
			<circle cx="82" cy="136" r="10" fill="#B8D4E8" />
			<circle cx="82" cy="133" r="4" fill="#E8F4F8" />
			<ellipse cx="82" cy="140" rx="5" ry="3" fill="#5B8FAD" />
			{ /* Author info */ }
			<rect x="98" y="128" width="40" height="5" rx="1" fill="#1E1E1E" />
			<rect x="98" y="136" width="55" height="3" rx="1" fill="#A7AAAD" />
			{ /* Post title */ }
			<rect x="98" y="146" width="120" height="6" rx="1" fill="#1E1E1E" />
			{ /* Excerpt */ }
			<rect x="98" y="156" width="150" height="4" rx="1" fill="#A7AAAD" />
			{ /* Action buttons */ }
			<rect x="230" y="128" width="12" height="8" rx="2" fill="#DCDCDE" />
			<rect x="246" y="128" width="12" height="8" rx="2" fill="#DCDCDE" />
		</g>
	</svg>
);

interface LandingPageOption {
	value: LandingPage;
	title: string;
	description: string;
	illustration: React.ReactNode;
}

interface LandingPageOptionCardProps {
	option: LandingPageOption;
	isSelected: boolean;
	isDisabled: boolean;
	onSelect: ( value: LandingPage ) => void;
}

function LandingPageOptionCard( {
	option,
	isSelected,
	isDisabled,
	onSelect,
}: LandingPageOptionCardProps ) {
	const handleClick = () => {
		if ( ! isDisabled ) {
			onSelect( option.value );
		}
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			handleClick();
		}
	};

	return (
		<div
			className={ clsx( 'landing-page-option-card', {
				'is-selected': isSelected,
				'is-disabled': isDisabled,
			} ) }
			role="radio"
			aria-checked={ isSelected }
			aria-disabled={ isDisabled }
			tabIndex={ isDisabled ? -1 : 0 }
			onClick={ handleClick }
			onKeyDown={ handleKeyDown }
		>
			<div className="landing-page-option-card__illustration">
				{ option.illustration }
				<input
					className="landing-page-option-card__radio"
					type="radio"
					name="landing-page-option"
					value={ option.value }
					checked={ isSelected }
					disabled={ isDisabled }
					onChange={ () => onSelect( option.value ) }
					tabIndex={ -1 }
					aria-label={ option.title }
				/>
			</div>
			<VStack className="landing-page-option-card__content" spacing={ 0 }>
				<Text className="landing-page-option-card__title" weight={ 500 }>
					{ option.title }
				</Text>
				<Text className="landing-page-option-card__description" variant="muted">
					{ option.description }
				</Text>
			</VStack>
		</div>
	);
}

export default function PreferencesDefaultLanding() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: defaultLandingPage } = useSuspenseQuery( {
		...rawUserPreferencesQuery(),
		select: ( preferences ): LandingPage => {
			if ( preferences[ 'sites-landing-page' ]?.useSitesAsLandingPage ) {
				return 'sites';
			}
			if ( preferences[ 'reader-landing-page' ]?.useReaderAsLandingPage ) {
				return 'reader';
			}
			return 'primary-site-dashboard';
		},
	} );

	const { mutateAsync: saveUserPreferences, isPending: isSavingUserPreferences } = useMutation(
		userPreferencesMutation()
	);

	const options: LandingPageOption[] = [
		{
			value: 'sites',
			title: __( 'All Sites' ),
			description: __( 'See a list of all your sites.' ),
			illustration: <AllSitesIllustration />,
		},
		{
			value: 'primary-site-dashboard',
			title: __( 'Primary Site' ),
			description: __( 'Go to your main site.' ),
			illustration: <PrimarySiteIllustration />,
		},
		{
			value: 'reader',
			title: __( 'Reader' ),
			description: __( 'View posts from sites you follow.' ),
			illustration: <ReaderIllustration />,
		},
	];

	const handleSelect = ( value: LandingPage ) => {
		const updatedAt = Date.now();
		saveUserPreferences( {
			'sites-landing-page': {
				useSitesAsLandingPage: value === 'sites',
				updatedAt,
			},
			'reader-landing-page': {
				useReaderAsLandingPage: value === 'reader',
				updatedAt,
			},
		} )
			.then( () => {
				createSuccessNotice( __( 'Default landing page saved.' ), {
					type: 'snackbar',
				} );
			} )
			.catch( () => {
				createErrorNotice( __( 'Failed to save default landing page.' ), {
					type: 'snackbar',
				} );
			} );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Default landing page' ) }
						description={ __( 'Choose what you see after logging into WordPress.com' ) }
					/>

					<HStack
						className="landing-page-options"
						spacing={ 0 }
						alignment="stretch"
						role="radiogroup"
						aria-label={ __( 'Default landing page' ) }
					>
						{ options.map( ( option ) => (
							<LandingPageOptionCard
								key={ option.value }
								option={ option }
								isSelected={ defaultLandingPage === option.value }
								isDisabled={ isSavingUserPreferences }
								onSelect={ handleSelect }
							/>
						) ) }
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
