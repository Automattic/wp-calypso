/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import TimelineItem from './timeline-item.jsx';

/**
 * Style dependencies
 */
import './style.scss';

export default class Timeline extends PureComponent {
	static propTypes = {
		children: ( props, propName, componentName ) => {
			const prop = props[ propName ];
			return (
				React.Children.toArray( prop ).find( child => child.type !== TimelineItem ) &&
				new Error( `${ componentName } only accepts "<TimelineItem />" elements` )
			);
		},
	};

	render() {
		return <div className="timeline">{ this.props.children }</div>;
	}
}
