import { PureComponent } from 'react';
import { Button, FoldableCard } from '../..';

export default class FoldableCardExample extends PureComponent {
	static displayName = 'FoldableCardExample';

	static defaultProps = {
		exampleCode: (
			<div>
				<div>
					<FoldableCard header="This is a foldable card" screenReaderText="More">
						These are its contents
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This is a foldable card with smooth animation"
						screenReaderText="More"
						smooth
						contentExpandedStyle={ { maxHeight: '112px' } }
					>
						<div style={ { padding: '16px 16px 0' } }>
							<p>These are its contents</p>
							<p>And some more</p>
						</div>
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This is a foldable card with a really long header content area that might wrap depending on the page width of the browser being used to view this page when the summary area is not hidden."
						screenReaderText="More"
					>
						These are the card's contents.
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This is a foldable card with a really long header content area that might wrap depending on the page width of the browser being used to view this page when the summary area is hidden."
						hideSummary
						screenReaderText="More"
					>
						These are the card's contents.
					</FoldableCard>
				</div>
				<div>
					<FoldableCard header="This is a compact card" compact screenReaderText="More">
						I'm tiny! :D
					</FoldableCard>
				</div>
				<div>
					<div>
						<FoldableCard header="This is a disabled card" disabled screenReaderText="More">
							You can't see me!
						</FoldableCard>
					</div>
				</div>
				<div>
					<FoldableCard
						header="This is a highlighted card"
						highlight="info"
						screenReaderText="More"
					>
						I'm highlighted!
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
						header={
							<div>
								<div>This is a multiline foldable card</div>
								<div>
									<small> with a summary component & a expanded summary component</small>
								</div>
							</div>
						}
						summary={
							<Button compact scary>
								Update
							</Button>
						}
						expandedSummary={
							<Button compact scary>
								Update
							</Button>
						}
					>
						Nothing to see here. Keep walking!
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This card includes click, open and close actions. Check your console!"
						onClick={ function () {
							console.log( 'Clicked!' );
						} }
						onClose={ function () {
							console.log( 'Closed!' );
						} }
						onOpen={ function () {
							console.log( 'Opened!' );
						} }
					>
						Nothing to see here. Keep walking!
					</FoldableCard>
				</div>
			</div>
		),
	};

	handleClick = () => console.log( 'Clicked!' );
	handleClose = () => console.log( 'Closed!' );
	handleOpen = () => console.log( 'Opened!' );

	render() {
		return this.props.exampleCode;
	}
}
