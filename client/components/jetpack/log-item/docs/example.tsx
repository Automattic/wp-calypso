import { PureComponent, ReactNode } from 'react';
import CardHeading from 'calypso/components/card-heading';
import LogItem from '../';

export default class LogItemExample extends PureComponent {
	static displayName = 'LogItem';

	render(): ReactNode {
		return (
			<div>
				<LogItem header="Default Log Item" subheader="This is the subheader">
					This is a default log item.
				</LogItem>
				<LogItem header="Custom tag" subheader="^ there's a custom tag" tag="Custom">
					This log item has a custom tag.
				</LogItem>
				<LogItem header="HTML Contents" subheader="This is the subheader">
					<CardHeading tagName="h2" size={ 18 }>
						This is a header!
					</CardHeading>
				</LogItem>
				<LogItem header="Success!" subheader="Success type" highlight="success">
					This is a success log item.
				</LogItem>
				<LogItem header="Warning Log Item" subheader="This is the subheader" highlight="warning">
					This is a warning log item.
				</LogItem>
				<LogItem header="Error Log Item" subheader="This is the subheader" highlight="error">
					This is a error log item.
				</LogItem>
			</div>
		);
	}
}
