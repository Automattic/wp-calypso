import config from '@automattic/calypso-config';
import { Spinner } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	useNewsletterCategoriesQuery,
	useNewsletterCategorySubscriptionMutation,
	useSubscribedNewsletterCategories,
} from 'calypso/data/newsletter-categories';
import { NewsletterCategory } from 'calypso/data/newsletter-categories/types';

type SubscribeToNewsletterCategoriesProps = {
	siteId: number;
};

const convertToMutationFormat = (
	allCategories: NewsletterCategory[],
	subscribedCategoryIds: number[]
) =>
	allCategories.map( ( category ) => ( {
		term_id: category.id,
		subscribe: subscribedCategoryIds.includes( category.id ),
	} ) );

const SubscribeToNewsletterCategories = ( { siteId }: SubscribeToNewsletterCategoriesProps ) => {
	const translate = useTranslate();
	const { data: newsletterCategoriesData } = useNewsletterCategoriesQuery( { siteId } );
	const { data: subscribedNewsletterCategoriesData } = useSubscribedNewsletterCategories( {
		siteId,
	} );
	const subscribedCategoryIds = useMemo(
		() =>
			subscribedNewsletterCategoriesData?.newsletterCategories
				.filter( ( category ) => !! category.subscribed )
				.map( ( category ) => category.id ) || [],
		[ subscribedNewsletterCategoriesData ]
	);
	const { mutate, isLoading } = useNewsletterCategorySubscriptionMutation( siteId );

	const handleToggle = ( categoryId: number ) => {
		const updatedSubscribedCategoryIds = subscribedCategoryIds?.includes( categoryId )
			? subscribedCategoryIds?.filter( ( id ) => id !== categoryId )
			: [ ...subscribedCategoryIds, categoryId ];

		mutate(
			convertToMutationFormat(
				newsletterCategoriesData?.newsletterCategories || [],
				updatedSubscribedCategoryIds
			)
		);
	};

	if (
		! config.isEnabled( 'settings/newsletter-categories' ) ||
		! newsletterCategoriesData?.enabled
	) {
		return null;
	}

	return (
		<>
			<hr className="subscriptions__separator" />
			<div className="site-subscription-info">
				<h2 className="site-subscription-info__heading">{ translate( 'Subscription' ) }</h2>

				{ isLoadingCategories || isLoadingSubscribedCategories ? (
					<div className="site-subscription-info__loading">
						<Spinner />
					</div>
				) : (
				<dl className="site-subscription-info__list">
					<dt>{ translate( 'Subscribed to' ) }</dt>
					<dd>
						{ newsletterCategoriesData?.newsletterCategories.map( ( newletterCategory ) => (
							<div className="setting-item" key={ newletterCategory.id }>
								<ToggleControl
									checked={ subscribedCategoryIds?.includes( newletterCategory.id ) }
									onChange={ () => handleToggle( newletterCategory.id ) }
									disabled={ isLoading }
									label={ newletterCategory.name }
								/>
								<p className="setting-item__hint">
									{ translate( 'Receive emails for new posts in %s', {
										args: [ newletterCategory.name ],
										comment: 'Name of the site that the user tried to resubscribe to.',
									} ) }
								</p>
							</div>
						) ) }
					</dd>
				</dl>
				) }
			</div>
		</>
	);
};

export default SubscribeToNewsletterCategories;
