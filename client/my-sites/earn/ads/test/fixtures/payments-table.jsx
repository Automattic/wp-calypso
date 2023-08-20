export const wordAdsPaymentsWithValidPayments = `
<div>
    <div class="card payments_history">
        <div class="ads__module-header module-header">
            <h1 class="ads__module-header-title module-header-title">Payments history</h1>
        </div>
        <div class="ads__module-content module-content">
            <table>
                <thead>
                    <tr>
                        <th class="ads__payments-history-header">Payment Date</th>
                        <th class="ads__payments-history-header">Amount</th>
                        <th class="ads__payments-history-header">Status</th>
                        <th class="ads__payments-history-header">PayPal</th>
                        <th class="ads__payments-history-header">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="ads__payments-history-value">2022-01-15</td>
                        <td class="ads__payments-history-value">$100.00</td>
                        <td class="ads__payments-history-value">
                            <div class="badge badge--success ads__payments-history-badge">paid</div>
                        </td>
                        <td class="ads__payments-history-value">example@automattic.com</td>
                        <td class="ads__payments-history-value"></td>
                    </tr>
                    <tr>
                        <td class="ads__payments-history-value">2022-02-15</td>
                        <td class="ads__payments-history-value">$1.50</td>
                        <td class="ads__payments-history-value">
                            <div class="badge badge--error ads__payments-history-badge">failed</div>
                        </td>
                        <td class="ads__payments-history-value">example@automattic.com</td>
                        <td class="ads__payments-history-value">Failed for some reason</td>
                    </tr>
                    <tr>
                        <td class="ads__payments-history-value"><small>Estimated: 2022-03-15</small></td>
                        <td class="ads__payments-history-value">$100.00</td>
                        <td class="ads__payments-history-value">
                            <div class="badge badge--info ads__payments-history-badge">pending</div>
                        </td>
                        <td class="ads__payments-history-value">example@automattic.com</td>
                        <td class="ads__payments-history-value">Pending for some reason</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
`;
