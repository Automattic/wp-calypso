import { Children, PureComponent } from 'react';
import TimelineEvent from './timeline-event.jsx';

import './style.scss';

export default class Timeline extends PureComponent {
	static propTypes = {
		children: ( props, propName, componentName ) => {
			const prop = props[ propName ];
			return (
				Children.toArray( prop ).find( ( child ) => child.type !== TimelineEvent ) &&
				new Error( `${ componentName } only accepts "<TimelineItem />" elements` )
			);
		},
	};

	render() {
		return <div className="timeline">{ this.props.children }</div>;
	}
}
