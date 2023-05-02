# Kafka Loan Broker

This is an example application of the [Loan Broker][loan-broker] using
[Kafka](https://kafka.apache.org/). It's an implementation of the
[Scatter-Gather][scatter-gather] pattern.

## Installation

First, spin up a Kafka instance and create the topics.

```sh
docker compose up -d
./create-topics.sh
```

Then install the dependencies, build the application and start all the
processes.

```sh
npm install
npm run build
npm start
```

Finally, try to `POST` a quote:

```sh
curl -X POST http://localhost:3000/quotes \
  -H 'content-type:application/json' \
  -d '{"ssn":"111-22-3333","amount":300}'
```

Example response

```json
{
  "quoteId": "01GZE9CTGEFCXD4J8G6FFQ8NG2",
  "ssn": "111-22-3333",
  "amount": 300,
  "creditScore": 743,
  "quotes": [
    {
      "quote": {
        "bankName": "Bank of America",
        "isApproved": false,
        "reason": "You are poor"
      }
    },
    {
      "quote": {
        "bankName": "Capital One",
        "interestRate": "2.3%",
        "isApproved": true,
        "loanDuration": "30 months"
      }
    },
    {
      "quote": {
        "bankName": "Wells Fargo",
        "isApproved": false,
        "reason": "You are poor"
      }
    },
    {
      "quote": {
        "bankName": "Chase",
        "isApproved": false,
        "reason": "You are poor"
      }
    }
  ]
}
```

_Note: all banks are running exactly the same code._

[loan-broker]:
  https://www.enterpriseintegrationpatterns.com/patterns/messaging/ComposedMessagingExample.html
[scatter-gather]:
  https://www.enterpriseintegrationpatterns.com/patterns/messaging/BroadcastAggregate.html
