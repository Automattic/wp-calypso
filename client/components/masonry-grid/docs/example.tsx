import { PureComponent } from 'react';
import { MasonryGrid } from 'calypso/components/masonry-grid';

import './example.scss';

export class MasonryGridExample extends PureComponent {
	render() {
		return (
			<MasonryGrid className="masonry-grid-example">
				<div className="masonry-grid-example__item">
					1<br />
					1<br />
					1<br />
				</div>
				<div className="masonry-grid-example__item">
					2<br />
					2<br />
				</div>
				<div className="masonry-grid-example__item">3</div>
				<div className="masonry-grid-example__item">
					4<br />
					4<br />
					4<br />
				</div>
				<div className="masonry-grid-example__item">
					5<br />
					5<br />
					5<br />
					5<br />
				</div>
			</MasonryGrid>
		);
	}
}

MasonryGridExample.displayName = 'MasonryGrid';
