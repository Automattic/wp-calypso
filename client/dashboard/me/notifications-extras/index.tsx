import {
	meNotificationsExtrasSettingsMutation,
	meNotificationsSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	ToggleControl,
	Card,
	CardBody,
} from '@wordpress/components';
import { useMemo, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import type { WpcomNotificationSettings } from '@automattic/api-core';

const wpcomOptionKeys = [
	'marketing',
	'research',
	'community',
	'promotion',
	'news',
	'digest',
	'reports',
	'news_developer',
	'scheduled_updates',
] as const;

type WpcomOptionKey = ( typeof wpcomOptionKeys )[ number ];

const titles: Record< WpcomOptionKey, string > = {
	marketing: __( 'Suggestions' ),
	research: __( 'Research' ),
	community: __( 'Community' ),
	promotion: __( 'Promotions' ),
	news: __( 'Newsletter' ),
	digest: __( 'Digests' ),
	reports: __( 'Reports' ),
	news_developer: __( 'Developer Newsletter' ),
	scheduled_updates: __( 'Scheduled updates' ),
};

const descriptions: Record< WpcomOptionKey, string > = {
	marketing: __( 'Tips for getting the most out of WordPress.com.' ),
	research: __( 'Opportunities to participate in WordPress.com research and surveys.' ),
	community: __( 'Information on WordPress.com courses and events (online and in-person).' ),
	promotion: __( 'Sales and promotions for WordPress.com products and services.' ),
	news: __( 'WordPress.com news, announcements, and product spotlights.' ),
	digest: __( 'Popular content from the blogs you follow.' ),
	reports: __( 'Complimentary reports and updates regarding site performance and traffic.' ),
	news_developer: __( 'A once-monthly roundup of notable news for WordPress developers.' ),
	scheduled_updates: __( 'Complimentary reports regarding scheduled plugin updates.' ),
};

const jetpackOptionKeys = [
	'jetpack_marketing',
	'jetpack_research',
	'jetpack_promotion',
	'jetpack_news',
	'jetpack_reports',
] as const;

type JetpackOptionKey = ( typeof jetpackOptionKeys )[ number ];

const jetpackTitles: Record< JetpackOptionKey, string > = {
	jetpack_marketing: __( 'Suggestions' ),
	jetpack_research: __( 'Research' ),
	jetpack_promotion: __( 'Promotions' ),
	jetpack_news: __( 'Newsletter' ),
	jetpack_reports: __( 'Reports' ),
};

const jetpackDescriptions: Record< JetpackOptionKey, string > = {
	jetpack_marketing: __( 'Tips for getting the most out of Jetpack.' ),
	jetpack_research: __( 'Opportunities to participate in Jetpack research and surveys.' ),
	jetpack_promotion: __( 'Sales and promotions for Jetpack products and services.' ),
	jetpack_news: __( 'Jetpack news, announcements, and product spotlights.' ),
	jetpack_reports: __( 'Jetpack security and performance reports.' ),
};

export default function NotificationsExtras() {
	const { data } = useQuery( {
		...meNotificationsSettingsQuery(),
		meta: { persist: false },
	} );
	const mutation = useMutation( meNotificationsExtrasSettingsMutation() );

	const extraSettings: Partial< WpcomNotificationSettings > | undefined = data?.wpcom;

	const isSaving = mutation.isPending;

	const topToggleChecked = useMemo( () => {
		if ( ! extraSettings ) {
			return false;
		}
		// Checked when at least one option is enabled (mirrors legacy behavior)
		return wpcomOptionKeys.some( ( key ) => !! extraSettings[ key ] );
	}, [ extraSettings ] );

	const handleTopToggle = useCallback(
		( nextValue: boolean ) => {
			if ( ! extraSettings ) {
				return;
			}
			const payload: Partial< WpcomNotificationSettings > = {};
			wpcomOptionKeys.forEach( ( key ) => {
				if ( extraSettings[ key ] !== nextValue ) {
					payload[ key ] = nextValue;
				}
			} );
			if ( Object.keys( payload ).length > 0 ) {
				mutation.mutate( payload );
			}
		},
		[ extraSettings, mutation ]
	);

	const handleSingleToggle = useCallback(
		( key: WpcomOptionKey ) => ( nextValue: boolean ) => {
			mutation.mutate( { [ key ]: nextValue } as Partial< WpcomNotificationSettings > );
		},
		[ mutation ]
	);

	const hasJetpackOptions = useMemo( () => {
		if ( ! extraSettings ) {
			return false;
		}
		return jetpackOptionKeys.some( ( key ) => key in extraSettings );
	}, [ extraSettings ] );

	const jetpackTopToggleChecked = useMemo( () => {
		if ( ! extraSettings || ! hasJetpackOptions ) {
			return false;
		}
		return jetpackOptionKeys.some( ( key ) => !! ( extraSettings as any )[ key ] );
	}, [ extraSettings, hasJetpackOptions ] );

	const handleJetpackTopToggle = useCallback(
		( nextValue: boolean ) => {
			if ( ! extraSettings ) {
				return;
			}
			const payload: Partial< WpcomNotificationSettings > = {};
			jetpackOptionKeys.forEach( ( key ) => {
				const current = ( extraSettings as any )[ key ] as boolean | undefined;
				if ( current !== nextValue ) {
					( payload as any )[ key ] = nextValue;
				}
			} );
			if ( Object.keys( payload ).length > 0 ) {
				mutation.mutate( payload );
			}
		},
		[ extraSettings, mutation ]
	);

	const handleSingleJetpackToggle = useCallback(
		( key: JetpackOptionKey ) => ( nextValue: boolean ) => {
			mutation.mutate( { [ key ]: nextValue } as any );
		},
		[ mutation ]
	);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Extras' ) }
					description={ __(
						'Get curated extras like reports, digests, and community updates, so you can stay tuned for what’s happening in the WordPress ecosystem.'
					) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<SectionHeader level={ 3 } title={ __( 'Email from WordPress.com' ) } />
						<ToggleControl
							checked={ topToggleChecked }
							label={ topToggleChecked ? __( 'Unsubscribe from all' ) : __( 'Subscribe to all' ) }
							onChange={ handleTopToggle }
							disabled={ isSaving || ! extraSettings }
						/>

						{ wpcomOptionKeys.map( ( key ) => (
							<ToggleControl
								key={ key }
								checked={ !! extraSettings?.[ key ] }
								label={ titles[ key ] }
								help={ descriptions[ key ] }
								onChange={ handleSingleToggle( key ) }
								disabled={ isSaving || ! extraSettings }
							/>
						) ) }
					</CardBody>
				</Card>

				{ hasJetpackOptions && (
					<Card>
						<CardBody>
							<SectionHeader level={ 3 } title={ __( 'Email from Jetpack' ) } />
							<ToggleControl
								checked={ jetpackTopToggleChecked }
								label={
									jetpackTopToggleChecked ? __( 'Unsubscribe from all' ) : __( 'Subscribe to all' )
								}
								onChange={ handleJetpackTopToggle }
								disabled={ isSaving || ! extraSettings }
							/>

							{ jetpackOptionKeys.map( ( key ) => (
								<ToggleControl
									key={ key }
									checked={ !! ( extraSettings as any )?.[ key ] }
									label={ jetpackTitles[ key ] }
									help={ jetpackDescriptions[ key ] }
									onChange={ handleSingleJetpackToggle( key ) }
									disabled={ isSaving || ! extraSettings }
								/>
							) ) }
						</CardBody>
					</Card>
				) }
			</VStack>
		</PageLayout>
	);
}
