import { PureComponent } from 'react';
import {
	Default,
	Smooth,
	WithLongHeader,
	WithLongHeaderAndHiddenSummary,
	Compact,
	Disabled,
	Highlighted,
	WithCustomActionIcon,
	WithCustomSummary,
	WithMultilineHeader,
	WithClickOpenCloseActions,
} from '../stories/index.stories';

export default class FoldableCardExample extends PureComponent {
	static displayName = 'FoldableCardExample';

	static defaultProps = {
		exampleCode: (
			<div>
				<div>
					<Default />
				</div>
				<div>
					<Smooth />
				</div>
				<div>
					<WithLongHeader />
				</div>
				<div>
					<WithLongHeaderAndHiddenSummary />
				</div>
				<div>
					<Compact />
				</div>
				<div>
					<Disabled />
				</div>
				<div>
					<Highlighted />
				</div>
				<div>
					<WithCustomActionIcon />
				</div>
				<div>
					<WithCustomSummary />
				</div>
				<div>
					<WithMultilineHeader />
				</div>
				<div>
					<WithClickOpenCloseActions />
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
