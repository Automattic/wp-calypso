import { Spinner } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	useNewsletterCategorySubscriptionMutation,
	useSubscribedNewsletterCategories,
} from 'calypso/data/newsletter-categories';

type SubscribeToNewsletterCategoriesProps = {
	siteId: number;
};

const SubscribeToNewsletterCategories = ( { siteId }: SubscribeToNewsletterCategoriesProps ) => {
	const translate = useTranslate();
	const { data: subscribedNewsletterCategoriesData, isLoading } = useSubscribedNewsletterCategories(
		{ siteId }
	);
	const { mutate, isLoading: isSaving } = useNewsletterCategorySubscriptionMutation( siteId );

	const subscribedCategoryIds = useMemo(
		() =>
			subscribedNewsletterCategoriesData?.newsletterCategories
				?.filter( ( category ) => !! category.subscribed )
				.map( ( category ) => category.id ) || [],
		[ subscribedNewsletterCategoriesData ]
	);

	const handleToggle = ( categoryId: number ) => {
		mutate( [
			{
				term_id: categoryId,
				subscribe: ! subscribedCategoryIds.includes( categoryId ),
			},
		] );
	};

	if ( ! subscribedNewsletterCategoriesData?.enabled ) {
		return null;
	}

	return (
		<>
			<hr className="subscriptions__separator" />
			<div className="site-subscription-info">
				<h2 className="site-subscription-info__heading">{ translate( 'Subscription' ) }</h2>

				{ isLoading ? (
					<div className="site-subscription-info__loading">
						<Spinner />
					</div>
				) : (
					<dl className="site-subscription-info__list">
						<dt>{ translate( 'Subscribed to' ) }</dt>
						<dd>
							{ subscribedNewsletterCategoriesData?.newsletterCategories.map(
								( newletterCategory ) => (
									<div className="setting-item" key={ newletterCategory.id }>
										<ToggleControl
											checked={ newletterCategory.subscribed }
											onChange={ () => handleToggle( newletterCategory.id ) }
											disabled={ isSaving }
											label={ newletterCategory.name }
										/>
										<p className="setting-item__hint">
											{ translate( 'Receive emails for new posts in %s', {
												args: [ newletterCategory.name ],
												comment: 'Name of the site that the user tried to resubscribe to.',
											} ) }
										</p>
									</div>
								)
							) }
						</dd>
					</dl>
				) }
			</div>
		</>
	);
};

export default SubscribeToNewsletterCategories;
