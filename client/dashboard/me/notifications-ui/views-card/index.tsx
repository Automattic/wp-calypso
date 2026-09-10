import { userPreferenceQuery, userPreferencesMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	FlexBlock,
	FlexItem,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import type { NotificationsView } from '@automattic/api-core';

// The panel always shows these two first, so they are listed but neither switchable nor
// movable, and they are never written to the stored list.
const PINNED_VIEWS = [
	{ name: 'all', label: __( 'All' ), description: __( 'Everything, newest first.' ) },
	{
		name: 'unread',
		label: __( 'Unread' ),
		description: __( 'Notifications you haven’t opened yet.' ),
	},
];

/**
 * Mirrors the panel's own views and PREMADE_VIEWS in
 * apps/notifications/src/common/premade-views.ts. The dashboard can't import from that
 * package (see client/dashboard/.eslintrc.js), so the names must be kept in step by hand.
 *
 * `isPremade` sets the default for a view the user has never saved: the panel's own views
 * are shown, the optional premade ones are not.
 */
const ORDERABLE_VIEWS = [
	{
		name: 'comments',
		label: __( 'Comments' ),
		description: __( 'Comments and replies on your posts.' ),
		isPremade: false,
	},
	{
		name: 'follows',
		label: __( 'Subscribers' ),
		description: __( 'People who subscribed to your sites.' ),
		isPremade: false,
	},
	{
		name: 'likes',
		label: __( 'Likes' ),
		description: __( 'Likes on your posts and comments.' ),
		isPremade: false,
	},
	{
		name: 'new_posts',
		label: __( 'New posts' ),
		description: __( 'Posts from the sites you subscribe to.' ),
		isPremade: true,
	},
	{
		name: 'store',
		label: __( 'Store' ),
		description: __( 'Orders and payments from your store.' ),
		isPremade: true,
	},
	{
		name: 'site_health',
		label: __( 'Site health' ),
		description: __( 'Downtime, backups, scans, and imports.' ),
		isPremade: true,
	},
	{
		name: 'billing',
		label: __( 'Billing' ),
		description: __( 'Renewals, payment methods, and expiring plans.' ),
		isPremade: true,
	},
	{
		name: 'achievements',
		label: __( 'Achievements' ),
		description: __( 'Badges, streaks, and milestones.' ),
		isPremade: true,
	},
];

const PINNED_NAMES = PINNED_VIEWS.map( ( { name } ) => name );

// Order and visibility for every orderable view: the stored list first, in its order, then
// anything it doesn't mention at its default. Matches resolveViewOrder() in the panel.
const resolveViews = ( stored: NotificationsView[] ): NotificationsView[] => {
	const known = new Map( ORDERABLE_VIEWS.map( ( view ) => [ view.name, view ] ) );

	const mentioned = stored
		.filter( ( { name } ) => known.has( name ) && ! PINNED_NAMES.includes( name ) )
		.map( ( { name, hidden } ) => ( { name, hidden: !! hidden } ) );

	const mentionedNames = new Set( mentioned.map( ( { name } ) => name ) );

	return [
		...mentioned,
		...ORDERABLE_VIEWS.filter( ( { name } ) => ! mentionedNames.has( name ) ).map(
			( { name, isPremade } ) => ( { name, hidden: isPremade } )
		),
	];
};

const areSameViews = ( a: NotificationsView[], b: NotificationsView[] ) =>
	a.length === b.length &&
	a.every(
		( view, index ) => view.name === b[ index ].name && !! view.hidden === !! b[ index ].hidden
	);

export const ViewsCard = () => {
	const { recordTracksEvent } = useAnalytics();
	const { data: savedViews } = useSuspenseQuery( userPreferenceQuery( 'notifications-views' ) );
	const { mutate: saveViews, isPending } = useMutation(
		withSnackbar( userPreferencesMutation(), {
			success: __( 'Settings saved.' ),
			error: { source: 'server' },
		} )
	);

	// Re-seed when the saved value changes under us — the panel's own view picker writes
	// this preference too. Without it the form keeps editing a stale list, and Save turns
	// itself on with no edit and writes that stale list back over the panel's change.
	const [ savedSeed, setSavedSeed ] = useState( savedViews );
	const [ views, setViews ] = useState< NotificationsView[] >( () => resolveViews( savedViews ) );

	if ( savedSeed !== savedViews ) {
		setSavedSeed( savedViews );
		setViews( resolveViews( savedViews ) );
	}

	const toggleView = ( name: string, isVisible: boolean ) =>
		setViews( ( current ) =>
			current.map( ( view ) => ( view.name === name ? { ...view, hidden: ! isVisible } : view ) )
		);

	const moveView = ( index: number, offset: number ) =>
		setViews( ( current ) => {
			const next = [ ...current ];
			const [ moved ] = next.splice( index, 1 );
			next.splice( index + offset, 0, moved );
			return next;
		} );

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		recordTracksEvent( 'calypso_dashboard_notifications_views_updated', {
			views: views.map( ( { name, hidden } ) => ( hidden ? `-${ name }` : name ) ).join( ',' ),
		} );

		saveViews( { 'notifications-views': views } );
	};

	const labelFor = ( name: string ) =>
		ORDERABLE_VIEWS.find( ( view ) => view.name === name ) ?? { label: name, description: '' };

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit } aria-labelledby="notifications-views-heading">
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							headingId="notifications-views-heading"
							title={ __( 'Views' ) }
							description={ __(
								'Choose which views appear in the notifications panel, and the order they appear in.'
							) }
						/>
						<VStack spacing={ 3 }>
							{ PINNED_VIEWS.map( ( { name, label, description } ) => (
								<CheckboxControl
									__nextHasNoMarginBottom
									key={ name }
									label={ label }
									help={ description }
									checked
									disabled
									onChange={ () => {} }
								/>
							) ) }
							{ views.map( ( { name, hidden }, index ) => {
								const { label, description } = labelFor( name );

								return (
									// `alignment` on HStack sets both axes, so it must stay out of the main
									// axis here: the row's left edge has to line up with the pinned rows
									// above, and the movers with each other, whatever the help text says.
									<HStack key={ name } justify="space-between" alignment="flex-start" spacing={ 2 }>
										<FlexBlock>
											<CheckboxControl
												__nextHasNoMarginBottom
												label={ label }
												help={ description }
												checked={ ! hidden }
												onChange={ ( isVisible ) => toggleView( name, isVisible ) }
											/>
										</FlexBlock>
										<FlexItem>
											<ButtonStack justify="flex-end" expanded={ false }>
												<Button
													size="small"
													icon={ chevronUp }
													disabled={ index === 0 }
													onClick={ () => moveView( index, -1 ) }
													/* translators: %s is the name of a notifications view, e.g. Likes. */
													label={ sprintf( __( 'Move %s up' ), label ) }
												/>
												<Button
													size="small"
													icon={ chevronDown }
													disabled={ index === views.length - 1 }
													onClick={ () => moveView( index, 1 ) }
													/* translators: %s is the name of a notifications view, e.g. Likes. */
													label={ sprintf( __( 'Move %s down' ), label ) }
												/>
											</ButtonStack>
										</FlexItem>
									</HStack>
								);
							} ) }
						</VStack>
						<ButtonStack justify="flex-start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isPending }
								disabled={ isPending || areSameViews( views, resolveViews( savedViews ) ) }
							>
								{ __( 'Save' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
};
