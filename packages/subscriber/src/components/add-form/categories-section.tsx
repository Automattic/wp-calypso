import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl, useIsEnglishLocale } from '@automattic/i18n-utils';
import { Button, Popover, ToggleControl, FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { createInterpolateElement, useRef, useState } from '@wordpress/element';
import { info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

interface Props {
	siteId: number;
	siteUrl?: string;
	newsletterCategories?: Array< { name: string; id: number; parent?: number } >;
	selectedCategories: number[];
	setSelectedCategories: ( categories: number[] ) => void;
	isWPCOMSite?: boolean;
}

export const CategoriesSection: React.FC< Props > = ( {
	siteId,
	siteUrl = '',
	newsletterCategories = [],
	selectedCategories,
	setSelectedCategories,
	isWPCOMSite = false,
} ) => {
	const { __, hasTranslation } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();
	const [ showCategories, setShowCategories ] = useState( false );
	const [ showInfoPopover, setShowInfoPopover ] = useState( false );
	const infoButtonRef = useRef< HTMLButtonElement >( null );

	const handleCategoryChange = ( tokens: ( string | TokenItem )[] ) => {
		// Filter out any invalid category names.
		const validTokens = tokens
			.map( ( token ) => {
				const tokenName = typeof token === 'string' ? token : token.value;
				const category = newsletterCategories.find( ( cat ) => cat.name === tokenName );
				return category?.id;
			} )
			.filter( ( id ): id is number => id !== undefined );

		recordTracksEvent( 'calypso_subscriber_add_form_categories_change', {
			site_id: siteId,
			categories_count: validTokens.length,
			action: validTokens.length > selectedCategories.length ? 'added' : 'removed',
		} );

		setSelectedCategories( validTokens );
	};

	const handleToggle = ( value: boolean ) => {
		setShowCategories( value );
		if ( ! value ) {
			setSelectedCategories( [] );
		}
		recordTracksEvent( 'calypso_subscriber_add_form_categories_toggle', {
			site_id: siteId,
			enabled: value,
		} );
	};

	const getCategoriesUrl = () => {
		if ( ! isWPCOMSite ) {
			return siteUrl ? `${ siteUrl }/wp-admin/admin.php?page=jetpack#/newsletter` : `#`;
		}
		return `https://wordpress.com/settings/newsletter/${ siteId }`;
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
									link: <a href={ getCategoriesUrl() } target="_blank" rel="noopener noreferrer" />,
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
												isWPCOMSite
													? 'https://wordpress.com/support/newsletter-settings/enable-newsletter-categories/'
													: 'https://jetpack.com/newsletter/newsletter-categories/'
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
				<FormTokenField
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					__experimentalShowHowTo={ false }
					value={ selectedCategories
						.map( ( id ) => newsletterCategories.find( ( cat ) => cat.id === id )?.name ?? '' )
						.filter( ( name ) => name !== '' ) }
					suggestions={ newsletterCategories.map( ( cat ) => cat.name ) }
					onChange={ handleCategoryChange }
					label=""
					placeholder={
						isEnglishLocale || hasTranslation( 'Type to add categories' )
							? __( 'Type to add categories' )
							: __( 'Search…' )
					}
				/>
			) }
		</div>
	);
};
