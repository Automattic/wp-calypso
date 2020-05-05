/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import TimelineEvent from './timeline-event.jsx';

/**
 * Style dependencies
 */
import './style.scss';

export default class Timeline extends PureComponent {
	static propTypes = {
		children: ( props, propName, componentName ) => {
			const prop = props[ propName ];
			return (
				React.Children.toArray( prop ).find( ( child ) => child.type !== TimelineEvent ) &&
				new Error( `${ componentName } only accepts "<TimelineItem />" elements` )
			);
		},
	};

	render() {
		return <div className="timeline">{ this.props.children }</div>;
	}
}
