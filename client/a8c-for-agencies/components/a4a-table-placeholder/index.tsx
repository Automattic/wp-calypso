import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';

import './style.scss';

export default function A4ATablePlaceholder() {
	return (
		<div className="a4a-table-placeholder">
			<div className="a4a-table-placeholder__header">
				<TextPlaceholder />
			</div>

			<div className="a4a-table-placeholder__row">
				<TextPlaceholder />
				<TextPlaceholder />
			</div>

			<div className="a4a-table-placeholder__row">
				<TextPlaceholder />
				<TextPlaceholder />
			</div>
		</div>
	);
}
