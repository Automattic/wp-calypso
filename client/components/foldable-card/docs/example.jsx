/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import Button from 'components/button';

export default React.createClass( {
	displayName: 'FoldableCard',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<div>
				<div>
					<FoldableCard header="This is a foldable card" screenReaderText="More">
						These are its contents
					</FoldableCard>
				</div>

				<div>
					<FoldableCard header="This is a compact card" compact screenReaderText="More">
						I'm tiny! :D
					</FoldableCard>
				</div>
				<div>
					<FoldableCard header="This is a disabled card" disabled screenReaderText="More">
						You can't see me!
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This is a foldable card with a custom action icon"
						icon="arrow-down"
						screenReaderText="More"
						>
						These are its contents
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This is a compact box with summary"
						summary="Unexpanded Summary"
						expandedSummary="Expanded Summary"
						screenReaderText="More"
						>
						This is the main content of the card.
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header={ <div><div>This is a multiline foldable card</div><div><small> with a summary component & a expanded summary component</small></div></div> }
						summary={ <button className="button">Update</button> }
						expandedSummary={ <button className="button">Update</button> }
						screenReaderText="More">
						Nothing to see here. Keep walking!
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header={ <div><div>This is a multiline foldable card</div><div><small> with a summary component & a expanded summary component</small></div></div> }
						summary={ <Button compact scary>Update</Button> }
						expandedSummary={ <Button compact scary>Update</Button> }>
						Nothing to see here. Keep walking!
					</FoldableCard>
				</div>
			</div>
		);
	}
} );
