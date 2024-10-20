package org.squaddeep.interledger.model.accounts;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
@RequestMapping(path = "squad.deep/v1/person")
public class Person {
    private Wallet wallet;
    private Collection<Wallet> wallets;
    // account details
}
