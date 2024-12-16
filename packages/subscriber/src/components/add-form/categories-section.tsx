import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button, Popover, ToggleControl } from '@wordpress/components';
import { createInterpolateElement, useRef, useState } from '@wordpress/element';
import { info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { CategoryTreeSelector } from './category-tree-selector';

interface Props {
	siteId: number;
	newsletterCategories?: Array< { name: string; id: number; parent?: number } >;
	selectedCategories: string[];
	setSelectedCategories: ( categories: string[] ) => void;
}

export const CategoriesSection: React.FC< Props > = ( {
	siteId,
	newsletterCategories = [],
	selectedCategories,
	setSelectedCategories,
} ) => {
	const { __ } = useI18n();
	const [ showCategories, setShowCategories ] = useState( false );
	const [ showInfoPopover, setShowInfoPopover ] = useState( false );
	const infoButtonRef = useRef< HTMLButtonElement >( null );

	const handleCategoryChange = ( categoryId: number, checked: boolean ) => {
		const newSelectedCategories = checked
			? [ ...selectedCategories, categoryId.toString() ]
			: selectedCategories.filter( ( id ) => id !== categoryId.toString() );

		recordTracksEvent( 'calypso_subscriber_add_form_categories_change', {
			site_id: siteId,
			categories_count: newSelectedCategories.length,
			action: checked ? 'added' : 'removed',
		} );

		setSelectedCategories( newSelectedCategories );
	};

	const handleToggle = ( value: boolean ) => {
		setShowCategories( value );
		recordTracksEvent( 'calypso_subscriber_add_form_categories_toggle', {
			site_id: siteId,
			enabled: value,
		} );
	};

	return (
		<div className="add-subscriber__categories-container">
			<h3>
				{ __( 'Categories' ) } <span>({ __( 'optional' ) })</span>
			</h3>
			<ToggleControl
				__nextHasNoMarginBottom
				label={
					<div className="categories-toggle-container">
						<p>
							{ createInterpolateElement(
								__( 'Add these subscribers to specific <link>categories</link>.' ),
								{
									link: (
										<a
											href={ `/settings/newsletter/${ siteId }` }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								}
							) }
						</p>
						<Button
							icon={ info }
							onClick={ () => setShowInfoPopover( ! showInfoPopover ) }
							ref={ infoButtonRef }
						/>
						{ showInfoPopover && infoButtonRef.current && (
							<Popover
								anchor={ infoButtonRef.current }
								onClose={ () => setShowInfoPopover( false ) }
								position="middle left"
								noArrow={ false }
								ignoreViewportSize
							>
								<div className="categories-info-popover">
									<p>
										{ __(
											'Adding newsletter categories helps you segment your subscribers more effectively.'
										) }{ ' ' }
										<a
											href={ localizeUrl(
												'https://wordpress.com/support/newsletter-settings/enable-newsletter-categories/'
											) }
											target="_blank"
											rel="noopener noreferrer"
										>
											{ __( 'Learn more' ) }
										</a>
									</p>
								</div>
							</Popover>
						) }
					</div>
				}
				checked={ showCategories }
				onChange={ handleToggle }
			/>

			{ showCategories && newsletterCategories && (
				<CategoryTreeSelector
					categories={ newsletterCategories }
					selected={ selectedCategories.map( Number ) }
					onChange={ handleCategoryChange }
				/>
			) }
		</div>
	);
};
