import {
	CellMeasurer,
	CellMeasurerCache,
	List,
	WindowScroller,
} from '@automattic/react-virtualized';
import { useCallback, useRef } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import withDimensions from 'calypso/lib/with-dimensions';
import CommentRow from './comment-row';
import './styles.scss';
import type { PostSubscription } from '@automattic/data-stores/src/reader/types';

type CommentListProps = {
	posts?: PostSubscription[];
	width?: number;
};

const cellMeasureCache = new CellMeasurerCache( {
	fixedWidth: true,
	// Since all our rows are of equal height, we can use this performance optimization
	keyMapper: () => 1,
} );

const CommentList = ( { posts, width }: CommentListProps ) => {
	const translate = useTranslate();
	const windowScrollerRef = useRef();

	const rowRenderer = useCallback(
		( { index, key, style, parent } ) => {
			const post = posts?.[ index ];
			return post ? (
				<CellMeasurer
					cache={ cellMeasureCache }
					columnIndex={ 0 }
					key={ key }
					rowIndex={ index }
					parent={ parent }
				>
					{ ( { registerChild }: { registerChild: React.Ref< HTMLDivElement > } ) => (
						<div>
							<CommentRow { ...post } key={ key } forwardedRef={ registerChild } style={ style } />
						</div>
					) }
				</CellMeasurer>
			) : null;
		},
		[ posts ]
	);

	return (
		<div className="subscription-manager__comment-list" role="table">
			<div className="row-wrapper">
				<div className="row header" role="row">
					<span className="post" role="columnheader">
						{ translate( 'Subscribed post' ) }
					</span>
					<span className="title-box" role="columnheader">
						{ translate( 'Site' ) }
					</span>
					<span className="date" role="columnheader">
						{ translate( 'Since' ) }
					</span>
					<span className="actions" role="columnheader" />
				</div>
			</div>

			<WindowScroller ref={ windowScrollerRef }>
				{ ( {
					height,
					scrollTop,
					registerChild,
				}: {
					height: number;
					scrollTop: number;
					registerChild: React.Ref< HTMLDivElement >;
				} ) => {
					return (
						<div ref={ registerChild }>
							<List
								autoHeight
								rowCount={ posts?.length }
								deferredMeasurementCache={ cellMeasureCache }
								rowHeight={ cellMeasureCache.rowHeight }
								height={ height }
								scrollTop={ scrollTop }
								width={ width }
								items={ posts }
								rowRenderer={ rowRenderer }
							/>
						</div>
					);
				} }
			</WindowScroller>
		</div>
	);
};

// cast as typeof CommentList to avoid TS error
export default withDimensions( CommentList ) as typeof CommentList;
