/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { InnerBlocks, RichText } from '@wordpress/editor';

class RecipeSave extends Component {
	render() {
		const {
			servings,
			time,
			difficulty,
			print,
			sourceurl,
			source,
			title,
			description,
			notes,
			ingredients,
			directions,
		} = this.props.attributes;
		const imageInnerBlockTemplate = [
			'core/image',
			{
				placeholder: __( 'Upload an image.', 'jetpack' ),
			},
		];

		return (
			<div class="hrecipe jetpack-recipe" itemscope itemtype="https://schema.org/Recipe">
				<RichText.Content tagName={ 'h3' } value={ title } className={ 'jetpack-recipe-title' } />
				<ul class="jetpack-recipe-meta">
					{ servings && (
						<li class="jetpack-recipe-servings" itemprop="recipeYield">
							<strong>{ __( 'Servings', 'jetpack' ) }: </strong>
							{ servings }
						</li>
					) }
					{ time && (
						<li class="jetpack-recipe-time">
							<time itemprop="totalTime" datetime={ time }>
								<strong>{ __( 'Duration', 'jetpack' ) }: </strong>
								{ time }
							</time>
						</li>
					) }
					{ difficulty && (
						<li class="jetpack-recipe-difficulty">
							<strong>{ __( 'Difficulty', 'jetpack' ) }: </strong>
							{ difficulty }
						</li>
					) }
					{ print && (
						<li class="jetpack-recipe-print">
							<a href="#">{ __( 'Print', 'jetpack' ) }</a>
						</li>
					) }
					{ sourceurl && (
						<li class="jetpack-recipe-source">
							<a href={ sourceurl }>{ source }</a>
						</li>
					) }
				</ul>
				<InnerBlocks.Content template={ imageInnerBlockTemplate } />
				{ description && (
					<p class="jetpack-recipe-description">
						<RichText.Content value={ description } />
					</p>
				) }
				<div class="jetpack-recipe-content">
					{ notes && (
						<div class="jetpack-recipe-notes">
							<h4 class="jetpack-recipe-notes-title">{ __( 'Notes', 'jetpack' ) }</h4>
							<RichText.Content value={ notes } />
						</div>
					) }
					{ ingredients && (
						<div class="jetpack-recipe-ingredients">
							<h4 class="jetpack-recipe-ingredients-title">{ __( 'Ingredients', 'jetpack' ) }</h4>
							<RichText.Content tagName={ 'ul' } value={ ingredients } />
						</div>
					) }
					{ directions && (
						<div class="jetpack-recipe-directions">
							<h4 class="jetpack-recipe-directions-title">{ __( 'Directions', 'jetpack' ) }</h4>
							<RichText.Content tagName={ 'ol' } value={ directions } />
						</div>
					) }
				</div>
			</div>
		);
	}
}

export default RecipeSave;
