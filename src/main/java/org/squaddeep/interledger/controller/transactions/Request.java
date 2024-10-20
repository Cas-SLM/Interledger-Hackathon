package org.squaddeep.interledger.controller.transactions;

import java.net.URL;

public interface Request {

    URL getWalletAddress();

    String getQuote();
}
