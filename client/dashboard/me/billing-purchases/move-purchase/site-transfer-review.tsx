import {
	purchaseSiteTransferMutation,
	purchaseSiteTransferPreviewQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	CheckboxControl,
	__experimentalHeading as Heading,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, _x, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { purchaseSettingsRoute } from '../../../app/router/me';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import Notice, { NoticeActionButton } from '../../../components/notice';
import { SectionHeader } from '../../../components/section-header';
import SiteIcon from '../../../components/site-icon';
import { getTitleForDisplay, isDotcomPlan } from '../../../utils/purchase';
import { getSiteDisplayUrl } from '../../../utils/site-url';
import {
	getCompanionItems,
	getDefaultSelection,
	getSelectedSubscriptionIds,
	getVisibleWarnings,
	isBundledItem,
	isItemSelected,
} from './selection';
import type {
	Purchase,
	Site,
	SiteTransferIssue,
	SiteTransferItem,
	SiteTransferPreview,
} from '@automattic/api-core';

interface SiteTransferReviewProps {
	purchase: Purchase;
	targetSite: Site;
	onChangeSite: () => void;
}

function IssueList( { issues }: { issues: SiteTransferIssue[] } ) {
	if ( issues.length === 1 ) {
		return <Text as="p">{ issues[ 0 ].message }</Text>;
	}

	return (
		<ul className="move-purchase__issue-list">
			{ issues.map( ( issue ) => (
				<li key={ `${ issue.code }:${ issue.subscription_ids?.join( ',' ) ?? '' }` }>
					{ issue.message }
				</li>
			) ) }
		</ul>
	);
}

function getCompanionHelp( item: SiteTransferItem, isBundled: boolean ): string {
	if ( item.blocker ) {
		return item.blocker.message;
	}

	const help = [];
	if ( isBundled ) {
		help.push( __( 'Registered with this plan’s free domain credit.' ) );
	}
	if ( item.product_names.length > 0 ) {
		help.push(
			sprintf(
				// translators: %s is a comma-separated list of products, e.g. "Domain Registration, Professional Email".
				__( 'Includes %s.' ),
				item.product_names.join( ', ' )
			)
		);
	}
	return help.join( ' ' );
}

// WP REST (wpcom/v2) errors carry their code as `code`; v1.x errors use `error`.
function getErrorCode( error: Error ): string | undefined {
	if ( 'code' in error && typeof error.code === 'string' ) {
		return error.code;
	}
	return 'error' in error && typeof error.error === 'string' ? error.error : undefined;
}

function SiteSummary( { label, children }: { label: string; children: React.ReactNode } ) {
	return (
		<VStack spacing={ 1 }>
			<Text variant="muted">{ label }</Text>
			{ children }
		</VStack>
	);
}

function getMoveDescription( purchase: Purchase, preview: SiteTransferPreview ): string {
	if ( isDotcomPlan( purchase ) ) {
		return __(
			'The plan’s features move to the new site and leave the current one. The renewal date and price stay the same.'
		);
	}

	if ( preview.primary && preview.primary.product_names.length > 1 ) {
		return __(
			'The domain and any email subscriptions for it move together. The renewal date and price stay the same.'
		);
	}

	return __( 'The renewal date and price stay the same.' );
}

export function SiteTransferReview( {
	purchase,
	targetSite,
	onChangeSite,
}: SiteTransferReviewProps ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const {
		data: preview,
		error: previewError,
		isLoading: isPreviewLoading,
		isFetching: isPreviewFetching,
		refetch: refetchPreview,
	} = useQuery( purchaseSiteTransferPreviewQuery( purchase.ID, targetSite.ID ) );
	const { mutate: transfer, isPending: isTransferring } = useMutation(
		purchaseSiteTransferMutation( purchase.ID )
	);
	// Null until the user changes it, so the default can follow the preview.
	const [ chosenSelection, setChosenSelection ] = useState< Set< number > | null >( null );

	const productTitle = getTitleForDisplay( purchase );

	if ( isPreviewLoading ) {
		return (
			<Card>
				<CardBody>
					<HStack justify="flex-start" spacing={ 3 }>
						<Spinner />
						<Text>
							{
								// translators: Shown while checking which subscriptions can be moved to another site.
								__( 'Checking what can move…' )
							}
						</Text>
					</HStack>
				</CardBody>
			</Card>
		);
	}

	if ( ! preview ) {
		return (
			<Notice
				variant="error"
				title={ __( 'Failed to check whether this purchase can move' ) }
				actions={
					<>
						<NoticeActionButton variant="outline" onClick={ () => refetchPreview() }>
							{ __( 'Try again' ) }
						</NoticeActionButton>
						<NoticeActionButton variant="minimal" onClick={ onChangeSite }>
							{ __( 'Choose a different site' ) }
						</NoticeActionButton>
					</>
				}
			>
				{ previewError?.message }
			</Notice>
		);
	}

	const bundledDomainSubscriptionId = purchase.included_domain_purchase_id;
	const companions = getCompanionItems( preview, bundledDomainSubscriptionId );
	const selection =
		chosenSelection ?? getDefaultSelection( companions, bundledDomainSubscriptionId );
	const warnings = [
		...( preview.primary?.type === 'domain' && targetSite.plan?.is_free
			? [
					{
						code: 'target_has_no_paid_plan',
						message: __(
							'The target site doesn’t have a paid plan, so you won’t be able to set this domain as primary on the site.'
						),
					},
				]
			: [] ),
		...getVisibleWarnings( preview, companions, selection ),
	];
	const sourceName = purchase.site_slug || purchase.domain;

	const toggleCompanion = ( item: SiteTransferItem, isSelected: boolean ) => {
		const next = new Set( selection );
		for ( const id of item.subscription_ids ) {
			if ( isSelected ) {
				next.add( id );
			} else {
				next.delete( id );
			}
		}
		setChosenSelection( next );
	};

	const onConfirm = () => {
		const subscriptionIds = getSelectedSubscriptionIds( companions, selection );
		const trackingProps = {
			product_slug: purchase.product_slug,
			target_blog_id: targetSite.ID,
			companion_count: subscriptionIds.length,
		};

		recordTracksEvent( 'calypso_purchases_site_transfer_submit', trackingProps );

		transfer(
			{
				target_blog_id: targetSite.ID,
				state_token: preview.state_token,
				subscription_ids: subscriptionIds,
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_purchases_site_transfer_success', trackingProps );
					createSuccessNotice(
						sprintf(
							// translators: %1$s is a product name, e.g. "Business plan"; %2$s is a site name.
							__( '%1$s moved to %2$s.' ),
							productTitle,
							targetSite.name
						),
						{ type: 'snackbar' }
					);
					navigate( {
						to: purchaseSettingsRoute.fullPath,
						// The site-level purchase pages carry the site in the URL, and it has changed.
						params: ( prev: Record< string, unknown > ) =>
							Object.assign(
								{},
								prev,
								{ purchaseId: purchase.ID },
								'siteSlug' in prev ? { siteSlug: targetSite.slug } : {}
							),
					} );
				},
				onError: ( error ) => {
					const code = getErrorCode( error );
					recordTracksEvent( 'calypso_purchases_site_transfer_error', {
						...trackingProps,
						error_code: code,
					} );

					if ( code === 'site_transfer_stale_preview' ) {
						refetchPreview();
						createErrorNotice(
							// translators: Error shown when a subscription or site changed while the user was reviewing moving a subscription to another site.
							__( 'Something changed since you started. Review the move again, then confirm.' ),
							{ type: 'snackbar' }
						);
						return;
					}

					createErrorNotice(
						error.message ||
							sprintf(
								// translators: %s is a product name, e.g. "Business plan".
								__( 'Failed to move %s. Try again.' ),
								productTitle
							),
						{
							type: 'snackbar',
						}
					);
				},
			}
		);
	};

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<SectionHeader
							title={
								// translators: Heading for a summary of the subscriptions about to be moved to another site.
								__( 'Review the move' )
							}
							level={ 3 }
						/>
						<HStack justify="flex-start" alignment="flex-start" spacing={ 8 } wrap>
							<SiteSummary
								label={
									// translators: Label above the name of the site a subscription is being moved away from.
									_x( 'From', 'subscription site transfer' )
								}
							>
								<Text weight={ 500 }>{ sourceName }</Text>
							</SiteSummary>
							<SiteSummary
								label={
									// translators: Label above the name of the site a subscription is being moved to.
									_x( 'To', 'subscription site transfer' )
								}
							>
								<HStack justify="flex-start" spacing={ 2 }>
									<SiteIcon site={ targetSite } size={ 24 } />
									<VStack spacing={ 0 }>
										<Text weight={ 500 }>{ targetSite.name }</Text>
										<Text variant="muted">{ getSiteDisplayUrl( targetSite ) }</Text>
									</VStack>
								</HStack>
							</SiteSummary>
						</HStack>
						<VStack spacing={ 2 }>
							<Heading level={ 4 } size={ 13 } weight={ 500 }>
								{
									// translators: Heading for the list of subscriptions that will be moved to another site.
									__( 'What moves' )
								}
							</Heading>
							<ul className="move-purchase__product-list">
								{ ( preview.primary?.product_names ?? [ productTitle ] ).map( ( name ) => (
									<li key={ name }>{ name }</li>
								) ) }
							</ul>
							<Text variant="muted">{ getMoveDescription( purchase, preview ) }</Text>
						</VStack>
						{ companions.length > 0 && (
							<VStack spacing={ 3 }>
								<VStack spacing={ 1 }>
									<Heading level={ 4 } size={ 13 } weight={ 500 }>
										{
											// translators: Heading for optional domains that can be moved to another site along with a plan.
											__( 'Move domains too' )
										}
									</Heading>
									<Text variant="muted">
										{ __( 'Domains you don’t select stay on the current site.' ) }
									</Text>
								</VStack>
								{ companions.map( ( item ) => (
									<CheckboxControl
										key={ item.subscription_ids[ 0 ] }
										label={ item.label }
										help={ getCompanionHelp(
											item,
											isBundledItem( item, bundledDomainSubscriptionId )
										) }
										checked={ ! item.blocker && isItemSelected( item, selection ) }
										disabled={ !! item.blocker || isTransferring || ! preview.can_transfer }
										onChange={ ( isSelected ) => toggleCompanion( item, isSelected ) }
									/>
								) ) }
							</VStack>
						) }
					</VStack>
				</CardBody>
			</Card>
			{ preview.blockers.length > 0 && (
				<Notice
					variant="error"
					title={ sprintf(
						// translators: %1$s is a product name, e.g. "Business plan"; %2$s is a site name.
						__( '%1$s can’t move to %2$s' ),
						productTitle,
						targetSite.name
					) }
				>
					<IssueList issues={ preview.blockers } />
				</Notice>
			) }
			{ preview.blockers.length === 0 && warnings.length > 0 && (
				<Notice
					variant="warning"
					title={
						// translators: Heading for warnings shown before moving a subscription to another site.
						__( 'Before you move' )
					}
				>
					<IssueList issues={ warnings } />
				</Notice>
			) }
			<ButtonStack justify="flex-end">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					disabled={ isTransferring }
					onClick={ onChangeSite }
				>
					{ __( 'Choose a different site' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isBusy={ isTransferring }
					disabled={ ! preview.can_transfer || isTransferring || isPreviewFetching }
					onClick={ onConfirm }
				>
					{ sprintf(
						// translators: Button that moves a subscription, such as a plan or domain, to another site. %s is the name of the site it moves to.
						_x( 'Move to %s', 'subscription site transfer' ),
						targetSite.name
					) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
