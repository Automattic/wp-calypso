/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Tile from 'calypso/components/tile-grid/tile';
import TileGrid from 'calypso/components/tile-grid';

/**
 * Main
 */
class TileGridExample extends PureComponent {
	static displayName = 'TileGrid';

	render() {
		return (
			<TileGrid>
				<Tile
					buttonLabel={ 'Start with a blog' }
					description={ 'To share your ideas, stories, and photographs with your followers.' }
					image={ '/calypso/images/illustrations/type-blog.svg' }
					onClick={ () => console.log( 'Clicked on the Blog tile' ) }
				/>
				<Tile
					buttonLabel={ 'Start with a website' }
					description={
						'To promote your business, organization, or brand and connect with your audience.'
					}
					image={ '/calypso/images/illustrations/type-website.svg' }
				/>
				<Tile
					buttonLabel={ 'Start with a portfolio' }
					description={ 'To present your creative projects in a visual showcase.' }
					image={ '/calypso/images/illustrations/type-portfolio.svg' }
					href="#"
				/>
				<Tile
					buttonLabel={ 'Start with an online store' }
					description={ 'To sell your products or services and accept payments.' }
					image={ '/calypso/images/illustrations/type-e-commerce.svg' }
					href="#"
				/>
			</TileGrid>
		);
	}
}

export default TileGridExample;
