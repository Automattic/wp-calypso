import { Icon } from '@wordpress/icons';
import blaze from '../blaze';
import blazeColored from '../blaze-colored';
import eye from '../eye';

export default { title: 'Icons' };

export const Default = () => (
	<div className="icons-story">
		<table>
			<tbody>
				<tr>
					<td>Blaze</td>
					<td>
						<Icon icon={ blaze } />
					</td>
				</tr>
				<tr>
					<td>Blaze (colored)</td>
					<td>
						<Icon icon={ blazeColored } />
					</td>
				</tr>
				<tr>
					<td>Eye</td>
					<td>
						<Icon icon={ eye } />
					</td>
				</tr>
			</tbody>
		</table>
	</div>
);
