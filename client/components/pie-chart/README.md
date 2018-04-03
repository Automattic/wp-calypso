# Pie Chart

This component renders a dataset as a pie chart.

## Props 

* **data** — (required) Array of objects holding the data
	* **value** - (required) (Number) the value of the datum
	* **name** - (required) (String) A name to represent the datum
	* **description** - (optional) (String) A longer description of the datum 
* **title** — (optional) title for the chart. It will be placed after the total of the data mounts ( "20 Tigers" where "Tigers" was the title )

## Usage

```jsx

import PieChart from 'components/pie-chart';

const PieChartExample = () => {
	return (
			<PieChart
				data={ [
					{
						value: 189,
						name: 'Direct',
						description: 'Customers who find your listing searching for your business or address',
					},
					{
						value: 362,
						name: 'Discovery',
						description:
							'Customers who find your listing searching for a category, product, or service',
					},
					{
						value: 122,
						name: 'Referral',
						description: 'Customers who find your listing by being referred from another type of search',

					}
				] }
				title={ 'Total Searches' }
			/>
	);

}
```

## Limits

Currently there are only 3 colors used in a pie chart. While there is no hard limit on exceeding this limit, it will make identifying the corresponding section difficult.

