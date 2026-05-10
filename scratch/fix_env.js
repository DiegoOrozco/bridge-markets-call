const fs = require('fs');

const credentials = {
  "type": "service_account",
  "project_id": "do-academy-auth",
  "private_key_id": "a387662c8529a8d280dc8113ecb7e4578945dd3d",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9QpQhv7ghlREt\nrJ/mGPcG1ppVbk9ZAenOrDNjCY7Rpu5KJ8/njVXpo3Mp/5sEswHIPkoWLzNb6ajH\nL1LF8hYERUoPo8ermzpxhT6Xiy0PVazorkev/xzA7Lb1stFxLpIbFhhEkBMdLVAP\nuQ652L+k93gaC8mar04YHdKapfE1DgJK7MtERk0Y3gT4wBYJIerUqaZ7mQVg7oBr\n4fI7lWwx6mmNO4h5tIod/GNEPLzSfk6zGm0/FKB/iT25hN8YmKWOYaUhA0Isrfdq\ni3h6sG7OuJvjgWW0Ar19sxtMhnL3/kam6dSatD9emsfZn1GOPl84NIhiVTUEiphA\nM1SNTMBDAgMBAAECggEAAtFreDyCZt7xLwoWJWxzZ9gpMHgghABEdXiDRAhqkSeY\nU7qtB1Mc7N+ArFGV2CeRhrmatngvHmwSax4tcCzEdCgooVFR0fXRPyB58p1hZzbi\nM2K+RtoYbleipRzrrnDq6a6rX4ClBYxdAqbsQmB+Vgaon1FT8qgv6amurvElRXdw\niTd2P43Wml5GUcdS9ZVUbfy/uiWxMKYXVa1AmogbrHy6zKIX42e7c/9VoT0Ug4Ur\riwpSWxbHfkClE/iRL2azbOcB4sbrbEszwV/V2VkFVS7RrhG78bNflBmnoiwtH3W\lszSW14jGV0R2OIUlXwFtlyu0zu7YwnPMFKBOxbO9QKBgQDoA/RKHtH0G9e2BScV\nLrm79eVot0l8JJsAHWUqo5ILqY3kjOuDOQZOy/gF6MiW1QzvZn/ITfaJM1qqhscL\nu877qAbJ8KRKzc8WBMOQx8UrJBmP6VgKcfuwEw8S1gunjECpQ2qXMiuACOxKTzJq\nkXzh/c4cTj4lLLfKOqUKbk6SnQKBgQDQ0yXxNHj8HA56qS/JThxGqPCm0UYicK05\nzEzfb5nc0CL97qH/ACg2lOz7qQHrrjYpeSfszQIkJ0oxyR2aLvSLbog5X2GTQL1u\koRYRUmUtwslews72bp3PXVl1EW9QCMegtOKfI+e5E52YemygJjzIvK5lAJvyd4z\nYax9CLo4XwKBgAlRX1Y6tqPfGmKtAkzPe5YY4gW6lrDtp2vxwkZcG1lsjc5H+o1i\nlOZFOsjB+IxWMhbLPwaEWwpXjaSblRLbkAx7SwqBJ5f5e/+eYVxHKZv57yzgajDB\nMyJ3IXvYLM+lylMB6h34XdbehN7XH2c4QJOy5bwtSEGl8hulD0vD8lPhAoGAfhWf\nKR33lrESBPm2QqOI6xkCBJcC87R4wxcZqyblDbAWEKBO63qazSnqVKDc6gJL7Yqb\nkpzNmCqo35qA5yFGwhFA6vMuJQzH08VfZzSeks5aSo0aYU67CVfwVEVwvi3FhpyT\nQWCoDtXmkg/YXNDMiLEnQOme9wQ5x2hID05/sZ0CgYEAvsnHTSzoP46eEiZMFzMv\nLub97RysmIRI1so7E6bgpS+S3gjA8+q+kyxJdclpTHaSgQ2PhCSBufH6j7wpPCEv\nPpIl9Q2g4TSLANys1e2Y9Fyob6nM+rrqmAbNWQ4AXxZyJ5zqpTdfZ6kN5+YJsOiJ\njyPuEtdga6jVzqiYONhNDE8=\n-----END PRIVATE KEY-----",
  "client_email": "attendance-bot@do-academy-auth.iam.gserviceaccount.com",
  "client_id": "106097922908451838839",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/attendance-bot%40do-academy-auth.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

const envContent = `DATABASE_URL="file:./dev.db"
EMAIL_USER="diorozcofo@gmail.com"
GOOGLE_CREDENTIALS='${JSON.stringify(credentials)}'
`;

fs.writeFileSync('.env', envContent);
console.log('.env updated successfully');
