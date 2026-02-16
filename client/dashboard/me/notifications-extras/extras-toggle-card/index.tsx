import { __experimentalVStack as VStack, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo, useCallback } from 'react';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import type { WpcomNotificationSettings } from '@automattic/api-core';

export type ExtrasToggleCardProps< Key extends keyof WpcomNotificationSettings & string > = {
	extraSettings?: Partial< WpcomNotificationSettings >;
	isSaving: boolean;
	onMutate: (
		payload: Partial< WpcomNotificationSettings >,
		origin: 'single' | 'subscribe-all' | 'unsubscribe-all'
	) => void;
	optionKeys: readonly Key[];
	titles: Record< Key, string >;
	descriptions?: Record< Key, string >;
	sectionTitle: string;
	sectionDescription?: JSX.Element | null;
};

export function ExtrasToggleCard< Key extends keyof WpcomNotificationSettings & string >( {
	extraSettings,
	isSaving,
	onMutate,
	optionKeys,
	titles,
	descriptions,
	sectionTitle,
	sectionDescription,
}: ExtrasToggleCardProps< Key > ) {
	const topToggleChecked = useMemo( () => {
		if ( ! extraSettings ) {
			return false;
		}
		return optionKeys.some( ( key ) => !! extraSettings[ key ] );
	}, [ extraSettings, optionKeys ] );

	const handleTopToggle = useCallback(
		( nextValue: boolean ) => {
			if ( ! extraSettings ) {
				return;
			}
			const payload: Partial< WpcomNotificationSettings > = {};
			optionKeys.forEach( ( key ) => {
				if ( extraSettings[ key ] !== nextValue ) {
					payload[ key ] = nextValue;
				}
			} );

			if ( Object.keys( payload ).length > 0 ) {
				onMutate( payload, nextValue ? 'subscribe-all' : 'unsubscribe-all' );
			}
		},
		[ extraSettings, onMutate, optionKeys ]
	);

	const handleSingleToggle = useCallback(
		( key: Key ) => ( nextValue: boolean ) => {
			onMutate( { [ key ]: nextValue } as Partial< WpcomNotificationSettings >, 'single' );
		},
		[ onMutate ]
	);

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 8 }>
					<SectionHeader level={ 3 } title={ sectionTitle } description={ sectionDescription } />

					<ToggleControl
						__nextHasNoMarginBottom
						checked={ topToggleChecked }
						label={
							<Text weight="bold">
								{ topToggleChecked ? __( 'Unsubscribe from all' ) : __( 'Subscribe to all' ) }
							</Text>
						}
						onChange={ handleTopToggle }
						disabled={ isSaving || ! extraSettings }
					/>

					<VStack>
						{ optionKeys.map( ( key ) => (
							<ToggleControl
								key={ key }
								__nextHasNoMarginBottom
								checked={ !! extraSettings?.[ key ] }
								label={ titles[ key ] }
								help={ descriptions?.[ key ] }
								onChange={ handleSingleToggle( key ) }
								disabled={ isSaving || ! extraSettings }
							/>
						) ) }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
