/** @jsxImportSource @emotion/react */

import { Button } from '@automattic/components';
import { MShotsImage } from '@automattic/design-picker';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const CustomButton = styled( Button )`
	opacity: 0;
	width: 90px;
	.demo-tile__button-container:hover & {
		opacity: 1;
	}
	transition: 200ms opacity linear, 200ms -webkit-filter linear;
	@media ( max-width: 960px ) {
		opacity: 1;
	}
`;

export default function DemoTile( {
	id,
	selectedDesign,
	image,
	templateUrl,
	name,
	onShowPreview,
	selectDesign,
}: {
	id: string;
	selectedDesign: string;
	image: string;
	templateUrl: string;
	name: string;
	onShowPreview: () => void;
	selectDesign: () => void;
} ): JSX.Element {
	const isSelected = selectedDesign === id;
	return (
		<div>
			<div
				css={ css`
					height: 230px;
					box-shadow: 0 0 0 1px var( --color-border-subtle );
					padding: 5px;
					cursor: pointer;
					position: relative;
					background: ${ isSelected ? 'var( --color-border-subtle )' : 'white' };
					border-color: var( --studio-gray-5 );
					border-radius: 4px;
					@media ( max-width: 960px ) {
						display: flex;
						padding: 5px;
					}
					&:hover {
						border-color: var( --studio-blue-20 );
					}
					&:hover .site-info-collection__preview {
						opacity: 1;
						animation: theme__thumbnail-label 200ms ease-in-out;
					}
					&:hover .mshots-image__container {
						filter: blur( 2px );
						-webkit-filter: blur( 2px );
						-moz-filter: blur( 2px );
						-o-filter: blur( 2px );
						-ms-filter: blur( 2px );
						-webkit-transition: 200ms -webkit-filter linear;
						-moz-transition: 200ms -moz-filter linear;
						-moz-transition: 200ms filter linear;
						-ms-transition: 200ms -ms-filter linear;
						-o-transition: 200ms -o-filter linear;
						transition: 200ms filter linear, 200ms -webkit-filter linear;
					}
				` }
			>
				<div
					className="demo-tile__button-container"
					css={ css`
						z-index: 5;
						position: absolute;
						width: 97%;
						height: 100%;
						display: flex;
						justify-content: center;
						align-items: center;
						flex-direction: column;
					` }
				>
					<CustomButton
						onClick={ ( e: React.MouseEvent< HTMLElement > ) => {
							e.stopPropagation();
							onShowPreview();
						} }
					>
						Preview
					</CustomButton>
					<CustomButton
						primary
						onClick={ ( e: React.MouseEvent< HTMLElement > ) => {
							e.stopPropagation();
							selectDesign();
						} }
					>
						Select
					</CustomButton>
				</div>
				<div
					css={ css`
						width: 100%;
						height: 100%;
						overflow: hidden;
						@media ( max-width: 960px ) {
							height: 100%;
							width: 100%;
						}
					` }
				>
					<MShotsImage
						url={ templateUrl + '?hide_banners=true' }
						aria-labelledby={ 'template-image' }
						alt={ 'Template Image' }
						options={ {
							vpw: 1024,
							vph: 1024,
							w: 660,
							screen_height: 3600,
						} }
						scrollable={ true }
					/>
					<img src={ image } width="100%" alt="WordPress logo" />
				</div>
			</div>
			<div
				css={ css`
					align-items: center;
					display: inline-flex;
					flex-wrap: wrap;
					margin-top: 8px;
					width: 100%;
				` }
			>
				<span
					css={ css`
						width: 100%;
						color: var( --color-neutral-70 );
						font-size: 0.875rem;
						font-weight: 600;
						padding: 0;
						text-align: left;
					` }
				>
					{ name }
				</span>
			</div>
		</div>
	);
}
