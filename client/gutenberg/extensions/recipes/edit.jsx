/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { InspectorControls, InnerBlocks, PlainText, RichText } from '@wordpress/editor';
import { CheckboxControl, RangeControl, TextControl } from '@wordpress/components';

class RecipeEdit extends Component {
	render() {
		const { attributes, setAttributes } = this.props;
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
		} = attributes;
		const imageInnerBlockTemplate = [
			'core/image',
			{
				placeholder: __( 'Upload an image.', 'jetpack' ),
			},
		];

		return (
			<div className="hrecipe jetpack-recipe" itemscope itemtype="https://schema.org/Recipe">
				<InspectorControls>
					<RangeControl
						label={ __( 'Servings', 'jetpack' ) }
						value={ servings }
						initialPosition={ 2 }
						onChange={ value => setAttributes( { servings: value } ) }
						min={ 1 }
						max={ 100 }
					/>
					<TextControl
						label={ __( 'Time', 'jetpack' ) }
						placeholder={ __( 'How long does it take?', 'jetpack' ) }
						value={ time }
						onChange={ value => setAttributes( { time: value } ) }
					/>
					<TextControl
						label={ __( 'Difficulty', 'jetpack' ) }
						placeholder={ __( 'How hard is this to make?', 'jetpack' ) }
						value={ difficulty }
						onChange={ value => setAttributes( { difficulty: value } ) }
					/>
					<CheckboxControl
						heading={ __( 'Display Print button', 'jetpack' ) }
						label={ __( 'Display Print', 'jetpack' ) }
						checked={ print }
						onChange={ value => setAttributes( { print: value } ) }
					/>
					<TextControl
						label={ __( 'Source', 'jetpack' ) }
						placeholder={ __( 'Link to the source of your recipe', 'jetpack' ) }
						value={ sourceurl }
						onChange={ value => setAttributes( { sourceurl: value } ) }
					/>
				</InspectorControls>
				<RichText
					tagName={ 'h3' }
					value={ title }
					onChange={ value => setAttributes( { title: value } ) }
					placeholder={ __( 'Enter the title of your recipe.', 'jetpack' ) }
					className={ 'jetpack-recipe-title' }
				/>
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
					{ sourceurl && (
						<li class="jetpack-recipe-source">
							<PlainText
								value={ source }
								onChange={ value => setAttributes( { source: value } ) }
							/>
						</li>
					) }
					{ print && (
						<li class="jetpack-recipe-print">
							<a href="#">{ __( 'Print', 'jetpack' ) }</a>
						</li>
					) }
				</ul>
				<InnerBlocks template={ [ imageInnerBlockTemplate ] } templateLock="all" />
				<RichText
					tagName={ 'p' }
					value={ description }
					onChange={ value => setAttributes( { description: value } ) }
					placeholder={ __( 'A quick description / summary about your recipe.', 'jetpack' ) }
					className={ 'jetpack-recipe-description' }
					formattingControls={ [] }
				/>
				<div class="jetpack-recipe-content">
					<h4 class="jetpack-recipe-notes-title">{ __( 'Notes', 'jetpack' ) }</h4>
					<RichText
						value={ notes }
						onChange={ value => setAttributes( { notes: value } ) }
						placeholder={ __( 'Add notes to your recipe.', 'jetpack' ) }
						multiline="p"
					/>
					<h4 class="jetpack-recipe-ingredients-title">{ __( 'Ingredients', 'jetpack' ) }</h4>
					<RichText
						tagName={ 'ul' }
						value={ ingredients }
						onChange={ value => setAttributes( { ingredients: value } ) }
						placeholder={ __( 'Add a list of all the ingredients needed.', 'jetpack' ) }
						multiline={ 'li' }
					/>
					<h4 class="jetpack-recipe-directions-title">{ __( 'Directions', 'jetpack' ) }</h4>
					<RichText
						tagName={ 'ol' }
						value={ directions }
						onChange={ value => setAttributes( { directions: value } ) }
						placeholder={ __( 'Add some directions.', 'jetpack' ) }
						multiline={ 'li' }
					/>
				</div>
			</div>
		);
	}
}

export default RecipeEdit;
