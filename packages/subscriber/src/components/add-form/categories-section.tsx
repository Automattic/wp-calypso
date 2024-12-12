import { localizeUrl } from '@automattic/i18n-utils';
import { Button, FormTokenField, Popover, ToggleControl } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { createInterpolateElement, useRef, useState } from '@wordpress/element';
import { info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

interface Props {
	siteId: number;
	newsletterCategories?: Array< { name: string } >;
	selectedCategories: string[];
	setSelectedCategories: ( categories: string[] ) => void;
}

export const CategoriesSection: React.FC< Props > = ( {
	siteId,
	newsletterCategories,
	selectedCategories,
	setSelectedCategories,
} ) => {
	const { __ } = useI18n();
	const [ showCategories, setShowCategories ] = useState( false );
	const [ showInfoPopover, setShowInfoPopover ] = useState( false );
	const infoButtonRef = useRef< HTMLButtonElement >( null );

	const handleCategoryChange = ( tokens: ( string | TokenItem )[] ) => {
		if ( ! newsletterCategories ) {
			return;
		}

		const validCategoryNames = new Set( newsletterCategories.map( ( cat ) => cat.name ) );
		const validCategories = tokens
			.map( ( token ) => ( typeof token === 'string' ? token : token.value ) )
			.filter( ( value ) => validCategoryNames.has( value ) );

		setSelectedCategories( validCategories );
	};

	return (
		<div className="add-subscriber__categories-container">
			<h3>
				{ __( 'Categories' ) } <span>({ __( 'optional' ) })</span>
			</h3>
			<ToggleControl
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
				onChange={ ( value ) => {
					setShowCategories( value );
				} }
			/>

			{ showCategories && newsletterCategories && (
				<FormTokenField
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					value={ selectedCategories }
					suggestions={ newsletterCategories.map( ( cat ) => cat.name ) }
					onChange={ handleCategoryChange }
					__experimentalShowHowTo={ false }
					label=""
				/>
			) }
		</div>
	);
};
